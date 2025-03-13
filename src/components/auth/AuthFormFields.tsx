
import { Input } from "@/components/ui/input";

interface AuthFormFieldsProps {
  emailOrUsername: string;
  setEmailOrUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isSignUp: boolean;
  loading: boolean;
}

export function AuthFormFields({
  emailOrUsername,
  setEmailOrUsername,
  password,
  setPassword,
  isSignUp,
  loading
}: AuthFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          {isSignUp ? "Email" : "Email or Username"}
        </label>
        <Input
          type={isSignUp ? "email" : "text"}
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          className="w-full"
          placeholder={isSignUp ? "Enter your email" : "Enter your email or username"}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
          placeholder="Enter your password"
          minLength={6}
          disabled={loading}
        />
      </div>
    </>
  );
}
