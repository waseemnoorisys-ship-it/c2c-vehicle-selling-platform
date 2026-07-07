import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchVehicleData, addMakeModel } from "../../api/admin.api";

export default function VehicleDataPage() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState({});
  const [selectedMake, setSelectedMake] = useState("");
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");

  useEffect(() => {
    fetchVehicleData().then((res) => {
      setMakes(res.data.data.makes);
      setModels(res.data.data.models);
    });
  }, []);

  async function handleAddMake(e) {
    e.preventDefault();
    if (!newMake.trim()) return;
    await addMakeModel(newMake, null);
    setMakes((prev) => [...prev, newMake]);
    setModels((prev) => ({ ...prev, [newMake]: [] }));
    setNewMake("");
    toast.success("Make added");
  }

  async function handleAddModel(e) {
    e.preventDefault();
    if (!selectedMake || !newModel.trim()) return;
    await addMakeModel(selectedMake, newModel);
    setModels((prev) => ({ ...prev, [selectedMake]: [...(prev[selectedMake] || []), newModel] }));
    setNewModel("");
    toast.success("Model added");
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Vehicle Data" subtitle="Manage makes and models database" />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-text-primary mb-4">Add Make</h2>
          <form onSubmit={handleAddMake} className="flex gap-3">
            <Input value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder="e.g. BMW" className="flex-1" />
            <Button type="submit" className="w-auto px-6 shrink-0">Add</Button>
          </form>

          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mt-6 mb-3">All Makes ({makes.length})</h3>
          <div className="flex flex-wrap gap-2">
            {makes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMake(m)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  selectedMake === m ? "border-primary-400 bg-primary-500/15 text-text-accent" : "border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-text-primary mb-4">
            Models {selectedMake ? `— ${selectedMake}` : ""}
          </h2>
          {selectedMake ? (
            <>
              <form onSubmit={handleAddModel} className="flex gap-3 mb-4">
                <Input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="e.g. X5" className="flex-1" />
                <Button type="submit" className="w-auto px-6 shrink-0">Add</Button>
              </form>
              <div className="space-y-2">
                {(models[selectedMake] || []).map((mod) => (
                  <div key={mod} className="px-3 py-2 rounded-lg border border-border text-sm text-text-secondary">
                    {mod}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">Select a make to view and add models.</p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
