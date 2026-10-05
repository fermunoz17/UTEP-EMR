import { useState } from "react";

export default function TagSelector({ value = [], onChange, placeholder = "Add item...", readOnly = false }) {
    const [inputValue, setInputValue] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    function handleAdd() {
        if (readOnly) return;
        const trimmed = inputValue.trim();
        if (!trimmed) {
            setIsAdding(false);
            return;
        }
        
        const newItems = trimmed.split(",")
            .map(item => item.trim())
            .filter(item => item && !value.includes(item));
        
        if (newItems.length > 0 && onChange) {
            onChange([...value, ...newItems]);
        }
        
        setInputValue("");
        setIsAdding(false);
    }

    function handleKeyDown(e) {
        if (readOnly) return;
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        } else if (e.key === "Escape") {
            setIsAdding(false);
            setInputValue("");
        }
    }

    function handleRemove(itemToRemove) {
        if (readOnly || !onChange) return;
        onChange(value.filter((item) => item !== itemToRemove));
    }

    return (
        <div>
            {value.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                    {value.map((item, index) => (
                        <div key={index} style={tagStyle}>
                            <span>{item}</span>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(item)}
                                    style={removeStyle}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && (
                isAdding ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`${placeholder} (or paste comma list)`}
                            autoFocus
                            style={{ flex: 1, padding: "0.4rem", boxSizing: "border-box", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                        />
                        <button type="button" onClick={handleAdd} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.375rem" }}>
                            Save
                        </button>
                        <button type="button" onClick={() => { setIsAdding(false); setInputValue(""); }} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.375rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button 
                        type="button" 
                        onClick={() => setIsAdding(true)} 
                        style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", borderRadius: "0.375rem", border: "1px dashed #9ca3af", background: "transparent", color: "#4b5563", cursor: "pointer" }}
                    >
                        + {placeholder}
                    </button>
                )
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
