import React from "react";
import { Upload } from "lucide-react";

const AddActivity = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-6 space-y-6">
        <div className="pb-4 border-b border-gray-100 space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Activity Details</h2>
          <p className="text-sm text-gray-500">
            Fill in the information below to create a new activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LabeledInput label="Activity Name" placeholder="e.g., Mountain Hiking" />
          <ThumbnailDrop />
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">
              Short Description
            </label>
            <textarea
              rows={4}
              placeholder="Brief description of the activity"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30 resize-none"
            />
          </div>
          <SelectField label="Category" placeholder="Select a category" />
          <SelectField label="Difficulty Level" placeholder="Easy" />
          <LabeledInput label="Location" placeholder="City, Country" />
          <SelectField label="Recommended Season" placeholder="Summer" />
          <SelectField label="Duration" placeholder="Select duration" />
          <StatusToggle />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100">
            Cancel
          </button>
          <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#a26e35] text-white hover:bg-[#8c5c2c]">
            Save Activity
          </button>
        </div>
      </div>

      <PreviewCard />
    </div>
  );
};

const LabeledInput = ({ label, placeholder }) => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">
      {label}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
    />
  </div>
);

const SelectField = ({ label, placeholder }) => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">
      {label}
    </label>
    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30">
      <option>{placeholder}</option>
    </select>
  </div>
);

const ThumbnailDrop = () => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">
      Thumbnail Image
    </label>
    <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center text-sm text-gray-500 p-6 min-h-[180px]">
      <Upload className="w-7 h-7 text-gray-400 mb-3" />
      <p className="font-semibold text-gray-600">Drag and drop or click to upload</p>
      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
    </div>
  </div>
);

const StatusToggle = () => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">Status</label>
    <div className="flex items-center gap-3">
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked className="sr-only peer" />
        <div className="w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-[#a26e35]/60 transition" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-6 peer-checked:bg-[#a26e35] transition" />
      </label>
      <span className="text-sm text-gray-600">Active</span>
    </div>
  </div>
);

const PreviewCard = () => (
  <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-6 space-y-4 h-fit self-start">
    <div>
      <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
      <p className="text-xs text-gray-400">How your activity will appear</p>
    </div>
    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-36 bg-gray-200 flex flex-col items-center justify-center text-gray-500 text-sm">
        <Upload className="w-5 h-5 mb-2" />
        Thumbnail preview
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-semibold text-slate-900">Activity Name</h4>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Location</p>
          <p>Duration</p>
        </div>
        <p className="text-xs text-gray-400">
          Short description will appear here...
        </p>
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold">
          Easy
        </span>
      </div>
    </div>
  </div>
);

export default AddActivity;

