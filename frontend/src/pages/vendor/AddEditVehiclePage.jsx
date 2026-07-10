import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import {
  createVehicleWithPhotos,
  updateVehicle,
  addListingPhotos,
  deleteListingPhoto,
  warmVehicleMasterCache,
} from "../../api/vehicles.api";
import { fetchVendorListingById } from "../../api/vendor.api";
import { getVehicleMasters, getModelsForMakeId } from "../../api/vehicleMaster.cache";
import { FILTER_OPTIONS } from "../../data/mockData";

const STEPS = ["Basic Info", "Details", "Photos", "Preview"];
const MAX_PHOTOS = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  makeId: "", modelId: "", year: "", price: "", mileage: "",
  fuel: "", transmission: "", location: "", description: "",
};

function createPhotoItem(file) {
  return {
    key: `new-${file.name}-${file.lastModified}-${Math.random()}`,
    file,
    preview: URL.createObjectURL(file),
    existing: false,
  };
}

export default function AddEditVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
  const photoItemsRef = useRef([]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoItems, setPhotoItems] = useState([]);
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    setMakes(getVehicleMasters().makes);
    warmVehicleMasterCache().finally(() => {
      setMakes(getVehicleMasters().makes);
    });
  }, []);

  useEffect(() => {
    if (form.makeId) {
      setModels(getModelsForMakeId(form.makeId));
    } else {
      setModels([]);
    }
  }, [form.makeId]);

  useEffect(() => {
    if (!isEdit || !id) return;
    fetchVendorListingById(id)
      .then((res) => {
        const v = res.data.data;
        setForm({
          makeId: v.makeId || "",
          modelId: v.modelId || "",
          year: String(v.year || ""),
          price: String(v.price || ""),
          mileage: String(v.mileage || ""),
          fuel: v.fuel || "",
          transmission: v.transmission || "",
          location: v.location || "",
          description: v.description || "",
        });
        const existing = (v.photos || []).map((photo, index) => ({
          key: `existing-${photo.publicId || index}`,
          preview: photo.url || photo,
          url: photo.url || photo,
          publicId: photo.publicId,
          existing: true,
        }));
        setPhotoItems(existing);
      })
      .catch(() => toast.error("Could not load listing"));
  }, [id, isEdit]);

  useEffect(() => {
    photoItemsRef.current = photoItems;
  }, [photoItems]);

  useEffect(() => {
    return () => {
      photoItemsRef.current.forEach((item) => {
        if (item.file && item.preview) URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      if (name === "makeId") return { ...f, makeId: value, modelId: "" };
      return { ...f, [name]: value };
    });
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const valid = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, or WebP allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: max size is 5 MB`);
        continue;
      }
      valid.push(file);
    }

    if (!valid.length) return;

    setPhotoItems((current) => {
      const remaining = MAX_PHOTOS - current.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
        return current;
      }
      const toAdd = valid.slice(0, remaining).map(createPhotoItem);
      if (valid.length > remaining) {
        toast.error(`Only ${remaining} more photo(s) can be added`);
      }
      return [...current, ...toAdd];
    });
  }

  function handleFileInput(e) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function removePhoto(key) {
    setPhotoItems((current) => {
      const item = current.find((p) => p.key === key);
      if (!item) return current;
      if (item.publicId) {
        setRemovedPublicIds((ids) => [...ids, item.publicId]);
      }
      if (item.file && item.preview) URL.revokeObjectURL(item.preview);
      return current.filter((p) => p.key !== key);
    });
  }

  function goToNextStep() {
    if (step === 2 && photoItems.length === 0) {
      toast.error("Add at least one vehicle photo");
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!form.makeId || !form.modelId) {
      toast.error("Select make and model. Admin must configure vehicle data first.");
      return;
    }
    if (photoItems.length === 0) {
      toast.error("Add at least one vehicle photo");
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        makeId: form.makeId,
        modelId: form.modelId,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        fuel: form.fuel,
        transmission: form.transmission,
        location: form.location,
      };
      const newFiles = photoItems.filter((p) => p.file).map((p) => p.file);

      if (isEdit) {
        await updateVehicle(id, payload);
        for (const publicId of removedPublicIds) {
          await deleteListingPhoto(id, publicId);
        }
        if (newFiles.length) {
          await addListingPhotos(id, newFiles);
        }
        toast.success("Vehicle updated!");
      } else {
        await createVehicleWithPhotos(payload, newFiles);
        toast.success("Vehicle submitted for approval!");
      }
      navigate("/vendor/listings");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  }

  const selectedMakeName = makes.find((m) => m.id === form.makeId)?.name || "";
  const selectedModelName = models.find((m) => m.id === form.modelId)?.name || "";

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader title={isEdit ? "Edit Vehicle" : "Add Vehicle"} subtitle="List your vehicle for sale" />

      {makes.length === 0 && (
        <p className="text-sm text-warning mb-4 p-3 rounded-lg border border-border bg-surface">
          No vehicle makes loaded. Ask admin to add makes in Admin → Vehicle Data, then refresh this page.
        </p>
      )}

      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition ${
                i === step ? "btn-gradient text-white" : i < step ? "bg-primary-500/15 text-text-accent border border-primary-400/20" : "bg-surface text-text-muted border border-border"
              }`}
            >
              {i + 1}. {s}
            </button>
            {i < STEPS.length - 1 && <span className="text-text-muted">→</span>}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        {step === 0 && (
          <div className="space-y-4 p-6 rounded-xl border border-border bg-surface">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Make</label>
                <select name="makeId" value={form.makeId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                  <option value="">Select Make</option>
                  {makes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Model</label>
                <select name="modelId" value={form.modelId} onChange={handleChange} disabled={!form.makeId} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none disabled:opacity-50">
                  <option value="">Select Model</option>
                  {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Year" name="year" type="number" value={form.year} onChange={handleChange} placeholder="2021" />
              <Input label="Price (€)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="45000" />
            </div>
            <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Paris, France" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 p-6 rounded-xl border border-border bg-surface">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Mileage (km)" name="mileage" type="number" value={form.mileage} onChange={handleChange} />
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Fuel Type</label>
                <select name="fuel" value={form.fuel} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                  <option value="">Select</option>
                  {FILTER_OPTIONS.fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                <option value="">Select</option>
                {FILTER_OPTIONS.transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none resize-none" placeholder="Describe your vehicle..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Vehicle photos</h3>
                <p className="text-xs text-text-muted mt-1">
                  Upload up to {MAX_PHOTOS} images (JPG, PNG, WebP · max 5 MB each)
                </p>
              </div>
              <span className="text-xs text-text-muted shrink-0">
                {photoItems.length}/{MAX_PHOTOS}
              </span>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                dragActive
                  ? "border-primary-400 bg-primary-500/10"
                  : "border-border hover:border-primary-400/50 hover:bg-background-secondary/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-500/15 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-text-primary font-medium">Click or drag photos here</p>
              <p className="text-xs text-text-muted mt-1">First photo becomes the cover image</p>
            </div>

            {photoItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photoItems.map((item, index) => (
                  <div key={item.key} className="relative group rounded-lg overflow-hidden border border-border aspect-[4/3] bg-background-secondary">
                    <img
                      src={item.preview}
                      alt={`Vehicle photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-black/60 text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhoto(item.key); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h3 className="font-semibold text-text-primary">Preview</h3>
            {photoItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photoItems.slice(0, 3).map((item) => (
                  <img
                    key={item.key}
                    src={item.preview}
                    alt=""
                    className="w-full h-20 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}
            <p className="text-text-secondary">{form.year} {selectedMakeName} {selectedModelName}</p>
            <p className="text-text-accent font-bold">€{form.price}</p>
            <p className="text-sm text-text-muted">{form.mileage} km · {form.fuel} · {form.transmission}</p>
            <p className="text-sm text-text-muted">{form.location}</p>
            <p className="text-xs text-text-muted">{photoItems.length} photo(s) attached</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="normal-case" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={goToNextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>Submit Listing</Button>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
