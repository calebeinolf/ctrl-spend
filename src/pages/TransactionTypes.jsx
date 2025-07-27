import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import ColorPickerModal from "../components/ColorPickerModal";
import AddTransactionLabelModal from "../components/AddTransactionLabelModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
const SortableTransactionTypeItem = ({
  type,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: type.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 sortable-item ${
        isSortableDragging
          ? "shadow-lg ring-2 ring-opacity-50 dnd-item-dragging rounded-full"
          : ""
      }`}
      style={{
        ...style,
        ...(isSortableDragging && {
          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
          borderColor: type.color,
          borderWidth: "2px",
          borderStyle: "solid",
        }),
      }}
    >
      <div className="bg-gray-100 rounded-full pr-4 h-14 flex items-center flex-1">
        <div
          {...attributes}
          {...listeners}
          className="!min-h-0 !min-w-0 p-4 cursor-grab active:cursor-grabbing touch-none drag-handle"
          style={{ touchAction: "none" }}
        >
          <GripVertical size={20} className="text-gray-400" />
        </div>

        <div
          className="w-5 h-5 mr-3 rounded-full"
          style={{ backgroundColor: type.color }}
        />

        <div className="flex-1">
          <p className="font-medium text-gray-900">{type.name}</p>
        </div>
      </div>

      <button
        onClick={() => onEdit(type)}
        className="flex items-center justify-center h-14 aspect-square bg-gray-100 rounded-full p-2 text-gray-600 hover:text-gray-600 min-w-[44px] min-h-[44px] transition-colors"
      >
        <Edit size={22} />
      </button>

      <button
        onClick={() => onDelete(type.id)}
        className="flex items-center justify-center h-14 aspect-square bg-gray-100 rounded-full p-2 text-red-400 hover:text-red-600 min-w-[44px] min-h-[44px] transition-colors"
      >
        <Trash2 size={22} />
      </button>
    </div>
  );
};

const TransactionTypes = () => {
  const navigate = useNavigate();
  const { settings, updateTransactionTypes, loading } = useAppData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const types = settings?.transactionTypes?.types || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddType = async (name, color) => {
    if (!name.trim()) return;

    const newType = {
      id: Date.now().toString(),
      name: name.trim(),
      color: color,
    };

    const updatedTypes = [...types, newType];

    setSaving(true);
    try {
      await updateTransactionTypes(updatedTypes);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding Transaction Label:", error);
    }
    setSaving(false);
  };

  const handleUpdateType = async (color, name) => {
    if (!editingType) return;

    const updatedTypes = types.map((type) =>
      type.id === editingType.id ? { ...type, color, name: name.trim() } : type
    );

    setSaving(true);
    try {
      await updateTransactionTypes(updatedTypes);
      setShowColorModal(false);
      setEditingType(null);
    } catch (error) {
      console.error("Error updating Transaction Label:", error);
    }
    setSaving(false);
  };

  const handleDeleteType = async (typeId) => {
    const updatedTypes = types.filter((type) => type.id !== typeId);

    setSaving(true);
    try {
      await updateTransactionTypes(updatedTypes);
    } catch (error) {
      console.error("Error deleting Transaction Label:", error);
    }
    setSaving(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = types.findIndex((type) => type.id === active.id);
      const newIndex = types.findIndex((type) => type.id === over.id);

      const newTypes = arrayMove(types, oldIndex, newIndex);

      setSaving(true);
      try {
        await updateTransactionTypes(newTypes);
      } catch (error) {
        console.error("Error reordering Transaction Labels:", error);
      }
      setSaving(false);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-lime-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Transaction Labels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 -ml-2 mr-2"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="select-none text-xl font-semibold text-gray-900">
              Transaction Labels
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="max-w-md mx-auto">
          <p className="p-6 text-gray-600 text-center text-sm">
            Press and hold to drag and reorder. Tap the edit icon to change name
            and color.
          </p>

          {/* Transaction Labels List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={types}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 pb-32 sortable-list">
                {types.map((type) => (
                  <SortableTransactionTypeItem
                    key={type.id}
                    type={type}
                    onEdit={(type) => {
                      setEditingType(type);
                      setShowColorModal(true);
                    }}
                    onDelete={handleDeleteType}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div
                  className="bg-white px-4 h-14 rounded-full shadow-xl border-2 flex items-center gap-4 transform rotate-2 dnd-overlay"
                  style={{
                    borderColor: types.find((t) => t.id === activeId)?.color,
                  }}
                >
                  <GripVertical size={20} className="text-gray-400" />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: types.find((t) => t.id === activeId)
                        ?.color,
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {types.find((t) => t.id === activeId)?.name}
                    </p>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Add Type Modal */}
      <AddTransactionLabelModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddType}
        saving={saving}
      />

      <div
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-26 w-26 bg-lime-600 rounded-full flex items-center justify-center text-white text-4xl cursor-pointer font-light transition-transform hover:scale-105 active:scale-95 z-10"
      >
        +
      </div>

      {/* Edit Type Modal */}
      <ColorPickerModal
        isOpen={showColorModal}
        onClose={() => {
          setShowColorModal(false);
          setEditingType(null);
        }}
        onColorSelect={handleUpdateType}
        currentColor={editingType?.color}
        currentName={editingType?.name}
        title={`Edit ${editingType?.name || "Transaction Label"}`}
      />
    </div>
  );
};

export default TransactionTypes;
