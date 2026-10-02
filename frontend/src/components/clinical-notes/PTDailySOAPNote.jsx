export const createEmptyPTNote = () => ({
    visitNumber: "",

    subjective: {
        patientReport: "",
        currentPain: "",
        functionalLimitations: "",
        changesSinceLastVisit: "",
    },

    objective: {
        rom: "",
        strength: "",
        gait: "",
        additionalFindings: "",
    },

    interventions: {
        therapeuticExercise: false,
        therapeuticActivity: false,
        neuromuscularReeducation: false,
        gaitTraining: false,
        manualTherapy: false,
        patientEducation: false,
        details: "",
    },

    assessment: {
        responseToTreatment: "",
        clinicalAssessment: "",
        progressTowardGoals: "",
    },

    goals: [],

    plan: {
        nextVisit: "",
        frequency: "",
        duration: "",
        homeExercise: "",
    },
});

function InterventionCheckbox({
    label,
    checked,
    onChange,
    disabled,
}) {
    return (
        <label className="intervention-checkbox">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />

            {label}
        </label>
    );
}

export default function PTDailySOAPNote({
    value,
    onChange,
    disabled = false,
}) {
    function updateSection(section, field, newValue) {
        onChange({
            ...value,
            [section]: {
                ...value[section],
                [field]: newValue,
            },
        });
    }

    return (
        <div className="clinical-note-form">

            <div className="clinical-note-heading">
                <div>
                    <h3>Physical Therapy Daily SOAP Note</h3>
                    <p>
                        Document the physical therapy treatment
                        provided during this visit.
                    </p>
                </div>
            </div>

            <div className="note-field">
                <label>Visit Number</label>

                <input
                    type="number"
                    min="1"
                    disabled={disabled}
                    value={value.visitNumber}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            visitNumber: e.target.value,
                        })
                    }
                />
            </div>

            <section className="soap-section">
                <h3>Subjective</h3>

                <div className="note-field">
                    <label>Patient Report</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.subjective.patientReport}
                        onChange={(e) =>
                            updateSection(
                                "subjective",
                                "patientReport",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Current Pain (0–10)</label>

                    <input
                        type="number"
                        min="0"
                        max="10"
                        disabled={disabled}
                        value={value.subjective.currentPain}
                        onChange={(e) =>
                            updateSection(
                                "subjective",
                                "currentPain",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Functional Limitations</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.subjective.functionalLimitations}
                        onChange={(e) =>
                            updateSection(
                                "subjective",
                                "functionalLimitations",
                                e.target.value
                            )
                        }
                    />
                </div>
            </section>

            <section className="soap-section">
                <h3>Objective</h3>

                <div className="note-field">
                    <label>Range of Motion (ROM)</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.objective.rom}
                        onChange={(e) =>
                            updateSection(
                                "objective",
                                "rom",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Strength</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.objective.strength}
                        onChange={(e) =>
                            updateSection(
                                "objective",
                                "strength",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Gait</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.objective.gait}
                        onChange={(e) =>
                            updateSection(
                                "objective",
                                "gait",
                                e.target.value
                            )
                        }
                    />
                </div>
            </section>

            <section className="soap-section">
                <h3>Interventions Performed</h3>

                <InterventionCheckbox
                    label="Therapeutic Exercise"
                    checked={value.interventions.therapeuticExercise}
                    disabled={disabled}
                    onChange={(checked) =>
                        updateSection(
                            "interventions",
                            "therapeuticExercise",
                            checked
                        )
                    }
                />

                <InterventionCheckbox
                    label="Therapeutic Activity"
                    checked={value.interventions.therapeuticActivity}
                    disabled={disabled}
                    onChange={(checked) =>
                        updateSection(
                            "interventions",
                            "therapeuticActivity",
                            checked
                        )
                    }
                />

                <InterventionCheckbox
                    label="Gait Training"
                    checked={value.interventions.gaitTraining}
                    disabled={disabled}
                    onChange={(checked) =>
                        updateSection(
                            "interventions",
                            "gaitTraining",
                            checked
                        )
                    }
                />

                <InterventionCheckbox
                    label="Manual Therapy"
                    checked={value.interventions.manualTherapy}
                    disabled={disabled}
                    onChange={(checked) =>
                        updateSection(
                            "interventions",
                            "manualTherapy",
                            checked
                        )
                    }
                />

                <div className="note-field">
                    <label>Intervention Details</label>

                    <textarea
                        rows={4}
                        disabled={disabled}
                        value={value.interventions.details}
                        onChange={(e) =>
                            updateSection(
                                "interventions",
                                "details",
                                e.target.value
                            )
                        }
                    />
                </div>
            </section>

            <section className="soap-section">
                <h3>Assessment</h3>

                <div className="note-field">
                    <label>Clinical Assessment</label>

                    <textarea
                        rows={4}
                        disabled={disabled}
                        value={value.assessment.clinicalAssessment}
                        onChange={(e) =>
                            updateSection(
                                "assessment",
                                "clinicalAssessment",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Progress Toward Goals</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.assessment.progressTowardGoals}
                        onChange={(e) =>
                            updateSection(
                                "assessment",
                                "progressTowardGoals",
                                e.target.value
                            )
                        }
                    />
                </div>
            </section>

            <section className="soap-section">
                <h3>Plan</h3>

                <div className="note-field">
                    <label>Plan for Next Visit</label>

                    <textarea
                        rows={3}
                        disabled={disabled}
                        value={value.plan.nextVisit}
                        onChange={(e) =>
                            updateSection(
                                "plan",
                                "nextVisit",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="note-field">
                    <label>Treatment Frequency</label>

                    <input
                        disabled={disabled}
                        value={value.plan.frequency}
                        onChange={(e) =>
                            updateSection(
                                "plan",
                                "frequency",
                                e.target.value
                            )
                        }
                        placeholder="Example: 2 visits/week"
                    />
                </div>

                <div className="note-field">
                    <label>Treatment Duration</label>

                    <input
                        disabled={disabled}
                        value={value.plan.duration}
                        onChange={(e) =>
                            updateSection(
                                "plan",
                                "duration",
                                e.target.value
                            )
                        }
                        placeholder="Example: 6 weeks"
                    />
                </div>
            </section>

        </div>
    );
}