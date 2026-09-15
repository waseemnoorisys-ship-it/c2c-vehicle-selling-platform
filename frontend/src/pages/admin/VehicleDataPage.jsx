import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { ADMIN_NAV } from "../../config/navigation";
import {
  fetchVehicleData,
  addMakeModel,
  updateMakeApi,
  deleteMakeApi,
  updateModelApi,
  deleteModelApi,
} from "../../api/admin.api";

export default function VehicleDataPage() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState({});
  const [selectedMake, setSelectedMake] = useState(null);
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingMake, setSubmittingMake] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);

  // Edit states
  const [editingMakeId, setEditingMakeId] = useState(null);
  const [editingMakeName, setEditingMakeName] = useState("");
  const [editingModelId, setEditingModelId] = useState(null);
  const [editingModelName, setEditingModelName] = useState("");

  // Custom Delete Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'make' | 'model', item: { id, name } }
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchVehicleData();
      const fetchedMakes = res.data?.data?.makes || [];
      const fetchedModels = res.data?.data?.models || {};
      setMakes(fetchedMakes);
      setModels(fetchedModels);

      if (fetchedMakes.length > 0) {
        setSelectedMake((prev) => {
          if (prev) {
            const found = fetchedMakes.find((m) => m.id === prev.id);
            if (found) return found;
          }
          return fetchedMakes[0];
        });
      } else {
        setSelectedMake(null);
      }
    } catch (err) {
      console.error("Failed to load vehicle data:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to load vehicle makes & models");
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
      setNewMake("");
      toast.success("Make added successfully");
      await loadData();
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
      await addMakeModel(selectedMake.name, newModel.trim());
      setNewModel("");
      toast.success(`Model "${newModel.trim()}" added for ${selectedMake.name}`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add model");
    } finally {
      setSubmittingModel(false);
    }
  }

  async function handleUpdateMake(makeId) {
    if (!editingMakeName.trim()) {
      toast.error("Make name cannot be empty");
      return;
    }
    try {
      await updateMakeApi(makeId, editingMakeName.trim());
      toast.success("Make updated successfully");
      setEditingMakeId(null);
      setEditingMakeName("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update make");
    }
  }

  async function handleUpdateModel(modelId) {
    if (!editingModelName.trim()) {
      toast.error("Model name cannot be empty");
      return;
    }
    try {
      await updateModelApi(modelId, editingModelName.trim());
      toast.success("Model updated successfully");
      setEditingModelId(null);
      setEditingModelName("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update model");
    }
  }

  async function confirmDelete() {
    if (!deleteModal) return;
    const { type, item } = deleteModal;
    setDeleting(true);
    try {
      if (type === "make") {
        await deleteMakeApi(item.id);
        toast.success(`Make "${item.name}" deleted successfully`);
        if (selectedMake?.id === item.id) setSelectedMake(null);
      } else {
        await deleteModelApi(item.id);
        toast.success(`Model "${item.name}" deleted successfully`);
      }
      setDeleteModal(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${type}`);
    } finally {
      setDeleting(false);
    }
  }

  const currentModels = selectedMake ? models[selectedMake.id] || [] : [];

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
                <div className="flex flex-wrap gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {makes.map((m) => {
                    const isSelected = selectedMake?.id === m.id;
                    const isEditing = editingMakeId === m.id;

                    if (isEditing) {
                      return (
                        <div key={m.id} className="flex items-center gap-1.5 bg-background border border-primary-400 p-1 rounded-lg">
                          <input
                            type="text"
                            value={editingMakeName}
                            onChange={(e) => setEditingMakeName(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-surface border border-border text-text-primary outline-none w-28"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateMake(m.id)}
                            className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMakeId(null)}
                            className="px-2 py-1 text-xs bg-surface-hover text-text-muted hover:text-text-primary rounded"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium transition ${
                          isSelected
                            ? "border-primary-400 bg-primary-500/15 text-text-accent shadow-sm"
                            : "border-border text-text-muted hover:text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedMake(m)}
                          className="outline-none"
                        >
                          {m.name}
                        </button>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 ml-1">
                          <button
                            type="button"
                            title="Edit Make"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMakeId(m.id);
                              setEditingMakeName(m.name);
                            }}
                            className="hover:text-amber-400 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Delete Make"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ type: "make", item: m });
                            }}
                            className="hover:text-rose-400 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Models Section */}
          <div className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-text-primary mb-4">
                Models {selectedMake ? `— ${selectedMake.name}` : ""}
              </h2>
              {selectedMake ? (
                <>
                  <form onSubmit={handleAddModel} className="flex items-end gap-3 mb-6">
                    <div className="flex-1 min-w-0">
                      <Input
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder={`e.g. X5 for ${selectedMake.name}`}
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
                    Available Models ({currentModels.length})
                  </h3>
                  {currentModels.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-4">
                      No models added for {selectedMake.name} yet.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                      {currentModels.map((mod) => {
                        const isEditingModel = editingModelId === mod.id;

                        if (isEditingModel) {
                          return (
                            <div key={mod.id} className="p-2 rounded-lg border border-primary-400 bg-background flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={editingModelName}
                                onChange={(e) => setEditingModelName(e.target.value)}
                                className="px-2 py-1 text-xs rounded bg-surface border border-border text-text-primary outline-none flex-1 min-w-0"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateModel(mod.id)}
                                className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shrink-0"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingModelId(null)}
                                className="px-2 py-1 text-xs bg-surface-hover text-text-muted hover:text-text-primary rounded shrink-0"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={mod.id}
                            className="group px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-text-primary flex items-center justify-between hover:border-border-accent transition"
                          >
                            <span className="truncate">{mod.name}</span>
                            <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 shrink-0 ml-2">
                              <button
                                type="button"
                                title="Edit Model"
                                onClick={() => {
                                  setEditingModelId(mod.id);
                                  setEditingModelName(mod.name);
                                }}
                                className="text-text-muted hover:text-amber-400 transition p-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                title="Delete Model"
                                onClick={() => setDeleteModal({ type: "model", item: mod })}
                                className="text-text-muted hover:text-rose-400 transition p-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
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

      {/* Custom Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary uppercase tracking-wide">
                  Are you sure?
                </h3>
                <p className="text-xs text-text-muted">Confirm deletion</p>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Do you really want to delete the {deleteModal.type}{" "}
              <span className="font-semibold text-text-primary">"{deleteModal.item.name}"</span>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-surface-hover transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
