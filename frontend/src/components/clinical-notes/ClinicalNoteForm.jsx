import PTDailySOAPNote from "./PTDailySOAPNote.jsx";

export default function ClinicalNoteForm({
    discipline,
    value,
    onChange,
    disabled = false,
}) {
    switch (discipline) {
        case "physical_therapy":
            return (
                <PTDailySOAPNote
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            );

        default:
            return (
                <p style={{ color: "#888" }}>
                    No clinical note template is available for this discipline yet.
                </p>
            );
    }
}