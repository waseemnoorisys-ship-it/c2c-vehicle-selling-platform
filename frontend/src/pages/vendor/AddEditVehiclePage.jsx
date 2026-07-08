import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { createVehicle, updateVehicle, warmVehicleMasterCache } from "../../api/vehicles.api";
import { fetchVendorListingById } from "../../api/vendor.api";
import { getVehicleMasters, getModelsForMakeId } from "../../api/vehicleMaster.cache";
import { FILTER_OPTIONS } from "../../data/mockData";

const STEPS = ["Basic Info", "Details", "Photos", "Preview"];

const EMPTY_FORM = {
  makeId: "", modelId: "", year: "", price: "", mileage: "",
  fuel: "", transmission: "", location: "", description: "",
};

export default function AddEditVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
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
      })
      .catch(() => toast.error("Could not load listing"));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      if (name === "makeId") return { ...f, makeId: value, modelId: "" };
      return { ...f, [name]: value };
    });
  }

  async function handleSubmit() {
    if (!form.makeId || !form.modelId) {
      toast.error("Select make and model. Admin must configure vehicle data first.");
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
      if (isEdit) {
        await updateVehicle(id, payload);
        toast.success("Vehicle updated!");
      } else {
        await createVehicle(payload);
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
          <div className="p-6 rounded-xl border border-border bg-surface text-center">
            <div className="border-2 border-dashed border-border rounded-xl p-12">
              <p className="text-text-muted text-sm">Photo upload via API coming soon.</p>
              <p className="text-xs text-text-muted mt-2">Use backend POST /listings/create-with-photos for now.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h3 className="font-semibold text-text-primary">Preview</h3>
            <p className="text-text-secondary">{form.year} {selectedMakeName} {selectedModelName}</p>
            <p className="text-text-accent font-bold">€{form.price}</p>
            <p className="text-sm text-text-muted">{form.mileage} km · {form.fuel} · {form.transmission}</p>
            <p className="text-sm text-text-muted">{form.location}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="normal-case" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>Submit Listing</Button>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
