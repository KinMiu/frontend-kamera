import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileCode2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Sparkles,
  Calendar,
  Layers,
  Send,
  RotateCcw,
  Sliders,
  DollarSign,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Comprehensive Zod schema for showcase
const showcaseSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  budget: z.coerce.number().min(100, 'Minimum project budget is $100').max(100000, 'Budget must not exceed $100,000'),
  category: z.string().min(1, 'Please choose a primary category'),
  projectDate: z.string().min(1, 'Please specify an execution target date'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  planType: z.enum(['starter', 'professional', 'enterprise'], {
    required_error: 'Please choose a plan tier',
  }),
  enableNotifications: z.boolean().default(true),
  enableTwoFactor: z.boolean().default(false),
  subscribeNewsletter: z.boolean().default(false),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type ShowcaseFormValues = z.infer<typeof showcaseSchema>;

export function FormShowcasePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submittedData, setSubmittedData] = useState<ShowcaseFormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShowcaseFormValues>({
    resolver: zodResolver(showcaseSchema),
    defaultValues: {
      fullName: 'John Doe',
      budget: 2500,
      category: 'cloud',
      projectDate: new Date().toISOString().split('T')[0],
      description: 'We are architecting a high-traffic microservices infrastructure with automated CI/CD pipelines.',
      planType: 'professional',
      enableNotifications: true,
      enableTwoFactor: true,
      subscribeNewsletter: true,
      termsAccepted: true,
    },
  });

  const selectedPlan = watch('planType');
  const enableNotifications = watch('enableNotifications');
  const enableTwoFactor = watch('enableTwoFactor');
  const termsAccepted = watch('termsAccepted');
  const descText = watch('description') || '';

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  const onSubmit = async (data: ShowcaseFormValues) => {
    // Simulate server submission
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmittedData(data);
    toast.success('Form submitted and validated successfully!', {
      description: 'Review the JSON Inspector card below for data structure.',
    });
  };

  const handleReset = () => {
    reset();
    setUploadedFiles([]);
    setSubmittedData(null);
    toast.info('Form reset to default values');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Form & Input Showcase
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Zod + Hook Form
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete showcase of accessible inputs, custom selectors, dropzones, and interactive validation rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Form</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Form Card */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Interactive Component Form
            </CardTitle>
            <CardDescription>
              Test field validations in real-time. Try entering invalid inputs or clearing required values.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Text Input & Number Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="text-[10px] text-primary font-medium">* Required</span>
                  </label>
                  <Input
                    placeholder="Enter full name"
                    error={Boolean(errors.fullName)}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Number Input / Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Project Budget (USD)</span>
                    <span className="text-[10px] text-muted-foreground">$100 - $100k</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="e.g. 2500"
                      className="pl-9"
                      error={Boolean(errors.budget)}
                      {...register('budget')}
                    />
                  </div>
                  {errors.budget && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.budget.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Select & Date Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Project Category
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger error={Boolean(errors.category)}>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloud">Cloud & DevOps Infrastructure</SelectItem>
                          <SelectItem value="frontend">Frontend & Mobile Development</SelectItem>
                          <SelectItem value="ai">AI & Machine Learning Pipelines</SelectItem>
                          <SelectItem value="security">Security & Audit Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Target Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Target Deployment Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      error={Boolean(errors.projectDate)}
                      {...register('projectDate')}
                    />
                  </div>
                  {errors.projectDate && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.projectDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Radio Card Group (Plan Tier) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Tier Selection (Radio Group)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'starter', title: 'Starter Plan', price: '$29/mo', desc: 'Up to 5 team members' },
                    { id: 'professional', title: 'Professional', price: '$89/mo', desc: 'Unlimited teams & APIs' },
                    { id: 'enterprise', title: 'Enterprise Pro', price: '$299/mo', desc: 'Dedicated 24/7 SLA' },
                  ].map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setValue('planType', plan.id as any)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                            : 'border-border/80 hover:border-primary/40 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-foreground">
                            {plan.title}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-foreground mb-1">
                          {plan.price}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{plan.desc}</div>
                      </div>
                    );
                  })}
                </div>
                {errors.planType && (
                  <p className="text-xs text-destructive">{errors.planType.message}</p>
                )}
              </div>

              {/* Row 4: Textarea with character count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Project Scope & Description
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {descText.length} / 500 chars
                  </span>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Describe technical objectives, expected workload, and SLAs..."
                  error={Boolean(errors.description)}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Row 5: Drag and Drop File Upload Zone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  File Upload Zone (Dropzone)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border/80 hover:border-primary/50 bg-muted/10'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Drag & drop files here, or <span className="text-primary underline">browse</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Supports PNG, JPG, PDF, ZIP (Max 25MB per file)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Switches & Toggles */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                      Email Alert Notifications
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Receive weekly analytic digests and system alerts.
                    </div>
                  </div>
                  <Switch
                    checked={enableNotifications}
                    onCheckedChange={(checked) => setValue('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                      Enforce Two-Factor Authentication (2FA)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Require OTP verification for all workspace changes.
                    </div>
                  </div>
                  <Switch
                    checked={enableTwoFactor}
                    onCheckedChange={(checked) => setValue('enableTwoFactor', checked)}
                  />
                </div>
              </div>

              {/* Row 7: Checkbox for Terms */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setValue('termsAccepted', checked === true)
                    }
                  />
                  <label
                    htmlFor="termsAccepted"
                    className="text-xs font-medium text-muted-foreground cursor-pointer"
                  >
                    I accept the administrative compliance and usage policies.
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-xs text-destructive">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Clear Fields
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isSubmitting}
                  className="gap-2 font-semibold"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Validating...' : 'Validate & Submit'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right 1 Col: Live JSON Inspector Card */}
        <div className="space-y-6">
          <Card className="border-border/80 shadow-xs sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Validated JSON Payload
              </CardTitle>
              <CardDescription>
                Outputs validated data upon successful submission.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {submittedData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Schema Validation Passed!</span>
                  </div>
                  <pre className="rounded-lg bg-muted/60 p-3 text-[11px] font-mono overflow-x-auto text-foreground border border-border/60">
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                  {uploadedFiles.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Attached files:{' '}
                      <span className="font-semibold text-foreground">
                        {uploadedFiles.map((f) => f.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 p-8 text-center space-y-2 bg-muted/20">
                  <FileCode2 className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    Awaiting Submission
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Click &ldquo;Validate & Submit&rdquo; to preview the sanitized JSON payload.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
