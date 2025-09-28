import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Identity = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    legalName: "",
    birthday: "",
    address: "",
    city: "",
    region: "",
    country: "",
  });

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const isAdult = useMemo(() => {
    if (!form.birthday) return false;
    const today = new Date();
    const dob = new Date(form.birthday);
    if (Number.isNaN(dob.getTime())) return false;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  }, [form.birthday]);

  const allFilled = useMemo(() => {
    return (
      form.legalName.trim() &&
      form.birthday.trim() &&
      form.address.trim() &&
      form.city.trim() &&
      form.region.trim() &&
      form.country.trim()
    );
  }, [form]);

  const canProceed = allFilled && isAdult;
  return (
    <div className="max-w-3xl mx-auto p-6 pb-28 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Help us verify your identity
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Before you can invest, we’re required by law to collect some
            information about you.
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="mt-8 space-y-4">
        {/* Legal Name - floating label */}
        <div className="relative">
          <input
            id="legalName"
            type="text"
            placeholder=" "
            value={form.legalName}
            onChange={onChange("legalName")}
            className="peer w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="legalName"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-150
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                       peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
                       peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
          >
            Legal Name
          </label>
        </div>

        {/* Birthday - keep standard label for native date input */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Birthday</label>
          <input
            type="date"
            value={form.birthday}
            onChange={onChange("birthday")}
            className={`w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
              form.birthday && !isAdult
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {form.birthday && !isAdult && (
            <p className="mt-1 text-sm text-red-600">
              You must be at least 18 years old.
            </p>
          )}
        </div>

        {/* Address - floating label */}
        <div className="relative">
          <input
            id="address"
            type="text"
            placeholder=" "
            value={form.address}
            onChange={onChange("address")}
            className="peer w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="address"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-150
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                       peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
                       peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
          >
            Address
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City - floating label */}
          <div className="relative">
            <input
              id="city"
              type="text"
              placeholder=" "
              value={form.city}
              onChange={onChange("city")}
              className="peer w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="city"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-150
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                         peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
                         peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              City
            </label>
          </div>
          {/* Region/Province - floating label */}
          <div className="relative">
            <input
              id="region"
              type="text"
              placeholder=" "
              value={form.region}
              onChange={onChange("region")}
              className="peer w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="region"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-150
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                         peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
                         peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Region/Province
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Country</label>
            <select
              value={form.country}
              onChange={onChange("country")}
              className="w-full rounded border px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select country</option>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
        </div>
      </form>

      {/* Fixed Footer actions at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            className="text-gray-700 underline underline-offset-2 hover:cursor-pointer"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type="button"
            disabled={!canProceed}
            className={`px-5 py-2 rounded text-white hover:cursor-pointer hover:bg-gray-600 ${
              canProceed
                ? "bg-black hover:bg-gray-900"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => canProceed && navigate("/welcome/interests")}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Identity;
