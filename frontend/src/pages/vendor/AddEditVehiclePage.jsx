import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { VENDOR_NAV } from "../../config/navigation";
import { createVehicle, updateVehicle } from "../../api/vehicles.api";
import { FILTER_OPTIONS } from "../../data/mockData";

const STEPS = ["Basic Info", "Details", "Photos", "Preview"];

const EMPTY_FORM = {
  make: "", model: "", year: "", price: "", mileage: "",
  fuel: "", transmission: "", bodyType: "", location: "", description: "",
  engine: "", power: "", color: "", doors: "",
};

export default function AddEditVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        title: `${form.year} ${form.make} ${form.model}`,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        fuel: form.fuel,
        transmission: form.transmission,
        bodyType: form.bodyType,
        location: form.location,
        description: form.description,
        specs: { engine: form.engine, power: form.power, color: form.color, doors: form.doors },
      };
      if (isEdit) {
        await updateVehicle(id, payload);
        toast.success("Vehicle updated!");
      } else {
        await createVehicle(payload);
        toast.success("Vehicle submitted for approval!");
      }
      navigate("/vendor/listings");
    } catch {
      toast.error("Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarLayout navItems={VENDOR_NAV} roleLabel="Seller Portal">
      <PageHeader title={isEdit ? "Edit Vehicle" : "Add Vehicle"} subtitle="List your vehicle for sale" />

      {/* Step indicator */}
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
                <select name="make" value={form.make} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                  <option value="">Select Make</option>
                  {FILTER_OPTIONS.makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Input label="Model" name="model" value={form.model} onChange={handleChange} placeholder="X5" />
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Transmission</label>
                <select name="transmission" value={form.transmission} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                  <option value="">Select</option>
                  {FILTER_OPTIONS.transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Body Type</label>
                <select name="bodyType" value={form.bodyType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none">
                  <option value="">Select</option>
                  {FILTER_OPTIONS.bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary outline-none resize-none" placeholder="Describe your vehicle..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Engine" name="engine" value={form.engine} onChange={handleChange} />
              <Input label="Power" name="power" value={form.power} onChange={handleChange} />
              <Input label="Color" name="color" value={form.color} onChange={handleChange} />
              <Input label="Doors" name="doors" value={form.doors} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 rounded-xl border border-border bg-surface text-center">
            <div className="border-2 border-dashed border-border rounded-xl p-12">
              <svg className="w-12 h-12 mx-auto text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-text-muted text-sm">Drag & drop photos here or click to upload</p>
              <Button variant="outline" className="w-auto px-6 mt-4 normal-case mx-auto" onClick={() => toast.success("Photo upload coming with backend")}>
                Upload Photos
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h3 className="font-semibold text-text-primary">Preview</h3>
            <p className="text-lg font-bold text-text-primary">{form.year} {form.make} {form.model}</p>
            <p className="text-text-accent font-bold text-xl">€{Number(form.price).toLocaleString()}</p>
            <p className="text-sm text-text-muted">{form.location} • {form.mileage} km • {form.fuel} • {form.transmission}</p>
            <p className="text-sm text-text-secondary mt-2">{form.description || "No description provided."}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="w-auto px-6 normal-case" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="w-auto px-6" onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button className="w-auto px-6" loading={loading} onClick={handleSubmit}>
              {isEdit ? "Update Listing" : "Submit Listing"}
            </Button>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
