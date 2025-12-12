export default function Pricing() {
  return (
    <div className="rounded-2xl border p-6 bg-white dark:bg-white/5">
      <h2 className="text-xl font-bold mb-4">Pricing Configuration</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <input className="input" placeholder="Base Fare (ETB)" defaultValue="35" />
        <input className="input" placeholder="Per KM (ETB)" defaultValue="12" />
        <input className="input" placeholder="Per Minute (ETB)" defaultValue="2" />
        <input className="input" placeholder="Pool Discount (%)" defaultValue="30" />
      </div>

      <button className="mt-4 px-4 py-2 bg-brand-500 text-white rounded">
        Save Changes
      </button>
    </div>
  );
}
