import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoaderIcon, InfoIcon } from "lucide-react";
import { addUser } from "@/firebase";
import { Member, MemberData } from "@/features/organization/members/types";
import { isValidStudentId } from "../utils";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedId: string;
  onStudentAdded: (student: Member) => void;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  suggestedId,
  onStudentAdded,
}: AddStudentDialogProps) {
  const [formData, setFormData] = useState<Member>({
    studentId: suggestedId,
    firstName: "",
    lastName: "",
    email: "",
    programId: "", // You might want to add fields for these
    facultyId: "", // Or pass them as props
    role: "user",
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    studentId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setFormData({
        studentId: suggestedId,
        firstName: "",
        lastName: "",
        email: "",
        programId: "",
        facultyId: "",
        role: "user",
      });
      setConsentChecked(false);
      setShowConsentError(false);
      setFormErrors({});
    }
  }, [open, suggestedId]);

  const validateForm = () => {
    const errors: {
      studentId?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {};

    if (!formData.studentId) {
      errors.studentId = "Student ID is required";
    } else if (!isValidStudentId(formData.studentId)) {
      errors.studentId = "Invalid format. Use XX-X-XXXXX (e.g., 20-1-01709)";
    }

    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!consentChecked) {
      setShowConsentError(true);
      return;
    }

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser(formData);
      onStudentAdded(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student details to add them to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              placeholder="XX-X-XXXXX (e.g., 29-1-12345)"
            />
            {formErrors.studentId && (
              <p className="text-sm text-destructive">{formErrors.studentId}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {formErrors.firstName && (
                <p className="text-sm text-destructive">
                  {formErrors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {formErrors.lastName && (
                <p className="text-sm text-destructive">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {formErrors.email && (
              <p className="text-sm text-destructive">{formErrors.email}</p>
            )}
          </div>
          <div className="border rounded-md p-4 bg-muted/50">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={consentChecked}
                onCheckedChange={(checked) => {
                  setConsentChecked(checked as boolean);
                  if (checked) setShowConsentError(false);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </Label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, I consent to the collection, storage,
                  and processing of my personal information for attendance
                  tracking purposes in accordance with the university's privacy
                  policy.
                </p>
              </div>
            </div>
            {showConsentError && (
              <p className="text-sm text-destructive mt-2">
                You must agree to the terms and conditions to continue
              </p>
            )}
          </div>
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-blue-700 text-sm">
              Your data will be used solely for attendance tracking purposes and
              will be handled in accordance with our privacy policy. You can
              request access or deletion of your data at any time.
            </AlertDescription>
          </Alert>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
