import { useState } from "react";
import medicines from "../data/medicines.json";

const FREQUENCIES = [1, 2, 3, 4];

export default function MedicationSelector({ value, onChange }) {
    // value: array of { medicine, dosage, frequency }
    const [selected, setSelected] = useState(null); // medicine object
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState(1);
    const [dosageError, setDosageError] = useState("");

    function handleSelect(med) {
        setSelected(med);
        setDosage("");
        setDosageError("");
    }

    function handleAdd() {
        if (!selected) return;

        const d = parseFloat(dosage);
        if (isNaN(d) || d < selected.min || d > selected.max) {
            setDosageError(`Dosage must be between ${selected.min}–${selected.max} ${selected.unit}.`);
            return;
        }

        // TODO: Add drug validation before allowing combinations.
        // For now, any medicine from the approved list can be added and mixed with any other medicine.
        onChange([...value, { medicine: selected, dosage: d, frequency }]);
        setSelected(null);
        setDosage("");
        setFrequency(1);
        setDosageError("");
    }

    function handleRemove(medId) {
        onChange(value.filter((v) => v.medicine.id !== medId));
    }

    return (
        <div>
            {/* Added medications */}
            {value.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                    {value.map((entry) => (
                        <div key={entry.medicine.id} style={tagStyle}>
                            <span>
                                <strong>{entry.medicine.name}</strong>
                                {" — "}{entry.dosage} {entry.medicine.unit}, {entry.frequency}x/day
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemove(entry.medicine.id)}
                                style={removeStyle}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/*
              * DEMO PURPOSES ONLY
              * This medication selector currently allows any combination of medicines.
              * Future implementations will include drug interaction checks and
              * rules for mixing medications (contraindications, dosage conflicts, etc.).
              */}
            <select
                value={selected?.id ?? ""}
                onChange={(e) => {
                    const med = medicines.find((m) => m.id === parseInt(e.target.value));
                    med ? handleSelect(med) : setSelected(null);
                    setDosageError("");
                }}
                style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box" }}
            >
                <option value="">— Select a medication —</option>
                {medicines
                    .filter((m) => !value.some((v) => v.medicine.id === m.id))
                    .map((m) => (
                        <option key={m.id} value={m.id}>
                            #{m.id} — {m.name} ({m.min}–{m.max} {m.unit})
                        </option>
                    ))}
            </select>

            {/* Dosage + Frequency */}
            {selected && (
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <label style={{ fontSize: "0.8rem" }}>
                            Dosage ({selected.unit}) — {selected.min}–{selected.max}
                        </label>
                        <input
                            type="number"
                            value={dosage}
                            onChange={(e) => { setDosage(e.target.value); setDosageError(""); }}
                            min={selected.min}
                            max={selected.max}
                            step="any"
                            placeholder={`${selected.min}–${selected.max}`}
                            style={{ width: "120px", padding: "0.4rem" }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <label style={{ fontSize: "0.8rem" }}>Frequency (per day)</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(parseInt(e.target.value))}
                            style={{ padding: "0.4rem" }}
                        >
                            {FREQUENCIES.map((f) => (
                                <option key={f} value={f}>{f}x / day</option>
                            ))}
                        </select>
                    </div>

                    <button type="button" onClick={handleAdd} style={{ padding: "0.4rem 0.9rem" }}>
                        Add
                    </button>
                </div>
            )}

            {dosageError && (
                <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>{dosageError}</p>
            )}
        </div>
    );
}

const tagStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.4rem 0.6rem",
    marginBottom: "0.4rem",
    background: "#f0f6ff",
    border: "1px solid #c0d8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
};

const removeStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    fontSize: "0.85rem",
    padding: "0 0.2rem",
};

