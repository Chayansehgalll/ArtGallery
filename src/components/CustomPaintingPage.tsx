import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, Loader2, Info } from "lucide-react";

// Types & Interfaces
interface FormFields {
  name: string;
  phone: string;
  frameType: string;
  estimatedSize: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  images?: string;
  frameType?: string;
  estimatedSize?: string;
  image?: File;
}

export default function CustomPaintingPage() {
  // Form Fields State
  const [formValues, setFormValues] = useState<FormFields>({
    name: "",
    phone: "",
    frameType: "",
    estimatedSize: "",
    notes: "",
  });

  // Images State
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // UI Status State
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Smooth Scroll to Form
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear targeted validation error on typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate Image Files
  const validateAndAddImages = (files: FileList) => {
    const currentImagesCount = images.length;
    const newFiles = Array.from(files);
    
    if (currentImagesCount + newFiles.length > 2) {
      setErrors((prev) => ({ ...prev, images: "Maximum 2 reference images allowed." }));
      return;
    }

    const validExtensions = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    let imageError = "";

    const filteredFiles = newFiles.filter((file) => {
      if (!validExtensions.includes(file.type)) {
        imageError = "Accepted formats: JPG, JPEG, PNG, WEBP.";
        return false;
      }
      if (file.size > maxSize) {
        imageError = "Maximum size per image is 10 MB.";
        return false;
      }
      return true;
    });

    if (imageError) {
      setErrors((prev) => ({ ...prev, images: imageError }));
      return;
    }

    setErrors((prev) => ({ ...prev, images: undefined }));
    setImages((prev) => [...prev, ...filteredFiles]);
    
    const newPreviews = filteredFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddImages(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndAddImages(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation Logic Separated From UI Submit Function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formValues.name.trim()) newErrors.name = "Name is required.";
    
    if (!formValues.phone.trim()) {
      newErrors.phone = "Mobile number is required.";
    } else if (!/^\+?[0-9]{7,15}$/.test(formValues.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (images.length === 0) {
      newErrors.images = "At least one reference image is required.";
    }

    if (!formValues.frameType) newErrors.frameType = "Frame type is required.";
    if (!formValues.estimatedSize) newErrors.estimatedSize = "Estimated size is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("phone", formValues.phone);
    formData.append("frameType", formValues.frameType);
    formData.append("estimatedSize", formValues.estimatedSize);
    formData.append("notes", formValues.notes);

    // Append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch('http://localhost:8080/api/custom-request', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      console.log("Response:", result); // Debug log

      if (response.ok && result.success) {
        // Clear form first
        setFormValues({ name: "", phone: "", frameType: "", estimatedSize: "", notes: "" });
        setImages([]);
        setImagePreviews([]);
        setErrors({});
        
        // Show success modal
        setShowSuccessModal(true);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormValues({ name: "", phone: "", frameType: "", estimatedSize: "", notes: "" });
    setImages([]);
    setImagePreviews([]);
    setErrors({});
    setShowSuccessModal(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="relative max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col items-center text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.15em] uppercase leading-tight">
            Bring Your <span className="font-light italic">Vision</span> to Life
          </h1>
          <p className="text-sm md:text-base text-white/60 tracking-wide max-w-xl mx-auto font-light leading-relaxed">
            Turn your memories, ideas, or inspirations into a handcrafted custom painting created just for you.
          </p>
          <div className="pt-4">
            <button
              onClick={scrollToForm}
              className="group relative px-8 py-3.5 bg-white text-black font-light text-xs uppercase tracking-[0.2em] rounded-none overflow-hidden transition-all duration-300 hover:bg-black hover:text-white border border-white"
            >
              <span className="relative z-10">Request a Custom Painting</span>
              <div className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-[0.22, 1, 0.36, 1]" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Information Cards Process Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Upload Reference", text: "Upload up to 2 reference images that best represent your idea." },
            { step: "02", title: "Tell Us Your Requirements", text: "Select your preferred frame, estimated size, and share your contact details." },
            { step: "03", title: "We'll Contact You", text: "Our team will review your request and get in touch with pricing, timeline, and further discussion." }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="p-8 bg-white/[0.02] border border-white/5 relative group hover:border-white/10 transition-colors duration-300 rounded-none backdrop-blur-md"
            >
              <span className="font-mono text-xs text-white/20 block mb-4 tracking-widest font-bold">{item.step}</span>
              <h3 className="text-md uppercase tracking-[0.15em] font-light mb-3 text-white/90">{item.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light font-sans">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form Submission Layout Interface Wrapper */}
      <section ref={formRef} className="max-w-[1000px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 shadow-2xl relative rounded-none backdrop-blur-xl"
        >
          <h2 className="text-xl uppercase tracking-[0.2em] font-light mb-8 text-center border-b border-white/5 pb-6">
            Painting Request Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            {/* Row Input Grid System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field with floating labels concept applied structure */}
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder=" "
                  className={`w-full bg-transparent border-b py-3 text-sm font-light tracking-wide focus:outline-none transition-colors duration-300 ${
                    errors.name ? 'border-red-500 text-red-400' : 'border-white/20 focus:border-white'
                  }`}
                  required
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-0 top-3 text-xs uppercase tracking-[0.15em] text-white/40 pointer-events-none transition-all duration-300 transform -translate-y-7 scale-95 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-95 input-float-label"
                >
                  Name <span className="text-red-400">*</span>
                </label>
                {errors.name && <p className="text-[11px] text-red-400 mt-1.5 font-light tracking-wide">{errors.name}</p>}
              </div>

              {/* Mobile Field Contact input container layer */}
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder=" "
                  className={`w-full bg-transparent border-b py-3 text-sm font-light tracking-wide focus:outline-none transition-colors duration-300 ${
                    errors.phone ? 'border-red-500 text-red-400' : 'border-white/20 focus:border-white'
                  }`}
                  required
                />
                <label 
                  htmlFor="phone" 
                  className="absolute left-0 top-3 text-xs uppercase tracking-[0.15em] text-white/40 pointer-events-none transition-all duration-300 transform -translate-y-7 scale-95 origin-left input-float-label"
                >
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                {errors.phone && <p className="text-[11px] text-red-400 mt-1.5 font-light tracking-wide">{errors.phone}</p>}
              </div>
            </div>

            {/* Dropdown Options Interface Setup Selector Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Frame Dropdown selector structure */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="frameType" className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Type of Frame <span className="text-red-400">*</span>
                </label>
                <select
                  id="frameType"
                  name="frameType"
                  value={formValues.frameType}
                  onChange={handleInputChange}
                  className={`w-full bg-black border text-xs font-light tracking-wider py-3 px-4 rounded-none focus:outline-none focus:border-white transition-colors appearance-none ${
                    errors.frameType ? 'border-red-500/50' : 'border-white/10'
                  }`}
                >
                  <option value="" disabled hidden>Choose Frame Architecture</option>
                  <option value="Canvas Wrap">Canvas Wrap</option>
                  <option value="Floating Frame">Floating Frame</option>
                  <option value="Wooden Frame">Wooden Frame</option>
                  <option value="Black Frame">Black Frame</option>
                  <option value="White Frame">White Frame</option>
                  <option value="Premium Gold Frame">Premium Gold Frame</option>
                  <option value="No Frame">No Frame</option>
                  <option value="Not Sure Yet">Not Sure Yet</option>
                </select>
                {errors.frameType && <p className="text-[11px] text-red-400 font-light tracking-wide">{errors.frameType}</p>}
              </div>

              {/* Estimated Dimension Dimension Dropdown */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="estimatedSize" className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Estimated Size <span className="text-red-400">*</span>
                </label>
                <select
                  id="estimatedSize"
                  name="estimatedSize"
                  value={formValues.estimatedSize}
                  onChange={handleInputChange}
                  className={`w-full bg-black border text-xs font-light tracking-wider py-3 px-4 rounded-none focus:outline-none focus:border-white transition-colors appearance-none ${
                    errors.estimatedSize ? 'border-red-500/50' : 'border-white/10'
                  }`}
                >
                  <option value="" disabled hidden>Select Physical Proportions</option>
                  <option value="12 × 16 inches">12 × 16 inches</option>
                  <option value="16 × 20 inches">16 × 20 inches</option>
                  <option value="18 × 24 inches">18 × 24 inches</option>
                  <option value="24 × 36 inches">24 × 36 inches</option>
                  <option value="30 × 40 inches">30 × 40 inches</option>
                  <option value="36 × 48 inches">36 × 48 inches</option>
                  <option value="Custom Size">Custom Size</option>
                  <option value="Not Sure Yet">Not Sure Yet</option>
                </select>
                {errors.estimatedSize && <p className="text-[11px] text-red-400 font-light tracking-wide">{errors.estimatedSize}</p>}
              </div>
            </div>

            {/* Drag & Drop Upload Media Component layout zone element rendering */}
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Reference Images <span className="text-red-400">*</span>
              </span>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 select-none ${
                  isDragActive 
                    ? "border-white bg-white/[0.04]" 
                    : errors.images 
                      ? "border-red-500/40 bg-red-500/[0.01]" 
                      : "border-white/10 hover:border-white/25 bg-white/[0.01]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={20} className="text-white/40 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs tracking-wider font-light">Drag & drop files or <span className="underline cursor-pointer">browse</span></p>
                  <p className="text-[10px] text-white/30 font-light">JPG, JPEG, PNG, WEBP up to 10MB (Max 2 images)</p>
                </div>
              </div>

              {errors.images && <p className="text-[11px] text-red-400 font-light tracking-wide">{errors.images}</p>}

              {/* Thumbnails list mapping configuration preview grid system */}
              <AnimatePresence>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={preview}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-square border border-white/10 overflow-hidden group rounded-sm shadow-md"
                      >
                        <img src={preview} alt={`Preview asset ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 text-white/80 rounded-full hover:bg-black hover:text-white transition-colors backdrop-blur-sm"
                          aria-label="Remove image request asset"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Additional Notes Custom Specification Textarea field */}
            <div className="flex flex-col space-y-2 relative">
              <label htmlFor="notes" className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Additional Specification Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                maxLength={500}
                value={formValues.notes}
                onChange={handleInputChange}
                placeholder="Describe specific painting styles, color palette parameters, timeline parameters, or general background expectations..."
                className="w-full bg-black border border-white/10 text-xs font-light tracking-wide p-4 rounded-none focus:outline-none focus:border-white transition-colors resize-none placeholder:text-white/20 leading-relaxed"
              />
              <div className="text-right text-[10px] text-white/30 font-mono tracking-wider">
                {formValues.notes.length} / 500 characters
              </div>
            </div>

            {/* Action Submit system logic activator */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative py-4 bg-white text-black font-light text-xs uppercase tracking-[0.25em] overflow-hidden transition-all duration-300 border border-white disabled:bg-white/40 disabled:border-transparent disabled:text-black/60 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing Submission Request...</span>
                  </>
                ) : (
                  <span>Submit Custom Painting Request</span>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </section>

      {/* Luxury Backdrop blur styled success dialog modal component state */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
              className="bg-[#0e0e0e] border border-white/10 p-8 md:p-10 max-w-md w-full text-center space-y-6 relative shadow-2xl"
            >
              <div className="flex justify-center">
                <CheckCircle2 size={44} className="text-white font-extralight opacity-90 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg uppercase tracking-[0.2em] font-light text-white">Thank You!</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed tracking-wide">
                  Your custom painting request has been sent successfully. Our team will review your submission and contact you shortly with further details regarding pricing, timeline, and next steps.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetForm}
                  className="w-full py-3 bg-white text-black text-xs font-light uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white border border-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}