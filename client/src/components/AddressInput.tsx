import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddressInputProps {
  value: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  onChange: (value: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  }) => void;
  required?: boolean;
  disabled?: boolean;
}

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

export function AddressInput({ value, onChange, required, disabled }: AddressInputProps) {
  const handleFieldChange = (field: string, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const validatePostcode = (postcode: string) => {
    // Australian postcodes are 4 digits
    return /^\d{4}$/.test(postcode);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">
          Street Address {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="street"
          value={value.street || ""}
          onChange={(e) => handleFieldChange("street", e.target.value)}
          placeholder="123 Main Street"
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            City/Suburb {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="city"
            value={value.city || ""}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            placeholder="Sydney"
            disabled={disabled}
            required={required}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={value.state || ""}
            onValueChange={(val) => handleFieldChange("state", val)}
            disabled={disabled}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {AUSTRALIAN_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postcode">
          Postcode {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="postcode"
          value={value.postcode || ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
            handleFieldChange("postcode", val);
          }}
          placeholder="2000"
          maxLength={4}
          disabled={disabled}
          required={required}
          className={
            value.postcode && !validatePostcode(value.postcode)
              ? "border-red-500"
              : ""
          }
        />
        {value.postcode && !validatePostcode(value.postcode) && (
          <p className="text-sm text-red-500">
            Postcode must be 4 digits
          </p>
        )}
      </div>
    </div>
  );
}

// Helper function to format address as single string
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
}): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postcode,
  ].filter(Boolean);
  
  return parts.join(", ");
}

// Helper function to parse address string into components
export function parseAddress(addressString: string): {
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
} {
  const parts = addressString.split(",").map((p) => p.trim());
  
  return {
    street: parts[0] || "",
    city: parts[1] || "",
    state: parts[2] || "",
    postcode: parts[3] || "",
  };
}

