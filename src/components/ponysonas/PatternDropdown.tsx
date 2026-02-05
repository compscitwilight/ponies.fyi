import { Pattern } from "@/generated/enums";

export function PatternDropdown({
    defaultValue,
    id,
    onChange
}: {
    defaultValue?: Pattern,
    id?: string, 
    onChange?: (newPattern: Pattern) => void
}) {
    return (
        <select
            id={id}
            className="border p-1 rounded-md border-gray-400/50 cursor-pointer"
            onChange={(e) => {
                if (onChange) onChange(e.target.value as Pattern)
            }}
            defaultValue={defaultValue}
        >
            {
                Object.values(Pattern).map((pattern: Pattern, index: number) =>
                    <option key={index} value={pattern}>{pattern}</option>
                )
            }
        </select>
    )
}