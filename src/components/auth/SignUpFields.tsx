
import { Input } from "@/components/ui/input";

interface SignUpFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  loading: boolean;
}

export function SignUpFields({ username, setUsername, loading }: SignUpFieldsProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Username</label>
      <Input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full"
        placeholder="Choose a username"
        disabled={loading}
      />
    </div>
  );
}
