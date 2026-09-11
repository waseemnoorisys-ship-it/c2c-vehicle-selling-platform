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
  const [loading, setLoading] = useState(true);
  const [submittingMake, setSubmittingMake] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchVehicleData();
      const fetchedMakes = res.data?.data?.makes || [];
      const fetchedModels = res.data?.data?.models || {};
      setMakes(fetchedMakes);
      setModels(fetchedModels);
      if (fetchedMakes.length > 0 && !selectedMake) {
        setSelectedMake(fetchedMakes[0]);
      }
    } catch (err) {
      console.error("Failed to load vehicle data:", err);
      toast.error("Failed to load vehicle makes & models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddMake(e) {
    e.preventDefault();
    if (!newMake.trim()) {
      toast.error("Please enter a make name");
      return;
    }
    setSubmittingMake(true);
    try {
      await addMakeModel(newMake.trim(), null);
      const makeName = newMake.trim();
      setMakes((prev) => (prev.includes(makeName) ? prev : [...prev, makeName]));
      setModels((prev) => ({ ...prev, [makeName]: prev[makeName] || [] }));
      setSelectedMake(makeName);
      setNewMake("");
      toast.success(`Make "${makeName}" added successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add make");
    } finally {
      setSubmittingMake(false);
    }
  }

  async function handleAddModel(e) {
    e.preventDefault();
    if (!selectedMake) {
      toast.error("Please select a make first");
      return;
    }
    if (!newModel.trim()) {
      toast.error("Please enter a model name");
      return;
    }
    setSubmittingModel(true);
    try {
      await addMakeModel(selectedMake, newModel.trim());
      const modelName = newModel.trim();
      setModels((prev) => ({
        ...prev,
        [selectedMake]: [...(prev[selectedMake] || []), modelName],
      }));
      setNewModel("");
      toast.success(`Model "${modelName}" added for ${selectedMake}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add model");
    } finally {
      setSubmittingModel(false);
    }
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader title="Vehicle Data" subtitle="Manage makes and models database" />

      {loading ? (
        <div className="p-12 text-center text-text-muted animate-pulse">
          Loading vehicle database...
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Makes Section */}
          <div className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-text-primary mb-4">Add Make</h2>
              <form onSubmit={handleAddMake} className="flex items-end gap-3 mb-6">
                <div className="flex-1 min-w-0">
                  <Input
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="e.g. BMW"
                  />
                </div>
                <Button
                  type="submit"
                  loading={submittingMake}
                  className="w-auto px-6 shrink-0 h-[42px]"
                >
                  Add
                </Button>
              </form>

              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                All Makes ({makes.length})
              </h3>
              {makes.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4">No makes created yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                  {makes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMake(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition ${
                        selectedMake === m
                          ? "border-primary-400 bg-primary-500/15 text-text-accent shadow-sm"
                          : "border-border text-text-muted hover:text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Models Section */}
          <div className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-text-primary mb-4">
                Models {selectedMake ? `— ${selectedMake}` : ""}
              </h2>
              {selectedMake ? (
                <>
                  <form onSubmit={handleAddModel} className="flex items-end gap-3 mb-6">
                    <div className="flex-1 min-w-0">
                      <Input
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder={`e.g. X5 for ${selectedMake}`}
                      />
                    </div>
                    <Button
                      type="submit"
                      loading={submittingModel}
                      className="w-auto px-6 shrink-0 h-[42px]"
                    >
                      Add
                    </Button>
                  </form>

                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Available Models ({(models[selectedMake] || []).length})
                  </h3>
                  {(models[selectedMake] || []).length === 0 ? (
                    <p className="text-xs text-text-muted italic py-4">
                      No models added for {selectedMake} yet.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {(models[selectedMake] || []).map((mod) => (
                        <div
                          key={mod}
                          className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-text-primary flex items-center justify-between"
                        >
                          <span>{mod}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-sm text-text-muted border border-dashed border-border rounded-xl">
                  Select a make from the left to view and add models.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
