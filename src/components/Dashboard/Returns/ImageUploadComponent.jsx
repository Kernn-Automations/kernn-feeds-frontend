import React, { useState, useRef } from 'react';
import styles from './Returns.module.css';

const ImageUploadComponent = ({ onImagesChange, maxImages = 5, maxSizeKB = 100 }) => {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        resolve({
          data: base64,
          type: file.type,
          filename: file.name,
          size: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Validate image
  const validateImage = (file) => {
    const maxSize = maxSizeKB * 1024; // Convert KB to bytes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      alert(`Only JPEG, PNG, and WebP images are allowed`);
      return false;
    }
    
    if (file.size > maxSize) {
      alert(`Image size must be less than ${maxSizeKB}KB. Current size: ${Math.round(file.size/1024)}KB`);
      return false;
    }
    
    return true;
  };

  // Handle file selection
  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateImage);
    
    if (validFiles.length !== fileArray.length) {
      alert('Some files were rejected due to validation errors');
    }
    
    if (images.length + validFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    try {
      const base64Images = await Promise.all(
        validFiles.map(file => convertToBase64(file))
      );
      
      const newImages = [...images, ...base64Images];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Error processing images');
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.imageUploadContainer}>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        
        <div className={styles.dropZoneContent}>
          <i className="bi bi-cloud-upload" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
          <p>Drag & drop images here or click to select</p>
          <p className="text-muted">
            Max {maxImages} images, {maxSizeKB}KB each
          </p>
        </div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className={styles.imagePreviewContainer}>
          <h6>Selected Images ({images.length}/{maxImages})</h6>
          <div className={styles.imageGrid}>
            {images.map((image, index) => (
              <div key={index} className={styles.imagePreviewItem}>
                <img
                  src={image.data}
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => removeImage(index)}
                >
                  <i className="bi bi-x"></i>
                </button>
                <div className={styles.imageInfo}>
                  <small>{image.filename}</small>
                  <small>{Math.round(image.size / 1024)}KB</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
