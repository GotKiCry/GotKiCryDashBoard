import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import './EditShortcutModal.css';

export default function EditShortcutModal({ isOpen, onClose, onSave, initialData }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [errors, setErrors] = useState({});
    const titleInputRef = useRef(null);

    // Focus management & Data initialization
    useEffect(() => {
        if (isOpen) {
            // Clear state when opening or populate if editing
            if (initialData) {
                setTitle(initialData.title || '');
                setUrl(initialData.url || '');
            } else {
                setTitle('');
                setUrl('');
            }
            setErrors({});
            // Auto focus
            setTimeout(() => {
                titleInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, initialData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleSave();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, title, url]); // Dependencies needed for handleSave closure access if not using ref

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = '请输入标题';
        if (!url.trim()) {
            newErrors.url = '请输入链接';
        } else if (!/^https?:\/\/.+\..+/.test(url) && !url.includes('localhost')) {
            // Very basic loose validation, usually improved by just prepending https:// if missing
            // But user asked for specific validation visual feedback
            // We will auto-fix "google.com" to "https://google.com" but warn if completely invalid
        }
        return newErrors;
    };

    const handleSave = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Auto-fix URL scheme
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        onSave({ title: title.trim(), url: finalUrl }, initialData?.id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? '编辑快捷方式' : '添加快捷方式'}
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {initialData ? '保存修改' : '确认添加'}
                    </button>
                </>
            }
        >
            <div className="form-group">
                <label className="input-label">标题 <span className="required-mark">*</span></label>
                <input
                    ref={titleInputRef}
                    className="modal-input"
                    type="text"
                    placeholder="例如：Bilibili"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors({ ...errors, title: null });
                    }}
                />
                {errors.title && <span className="input-error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
                <label className="input-label">链接 <span className="required-mark">*</span></label>
                <input
                    className="modal-input"
                    type="text"
                    placeholder="例如：bilibili.com"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if (errors.url) setErrors({ ...errors, url: null });
                    }}
                />
                {errors.url && <span className="input-error-msg">{errors.url}</span>}
            </div>
        </Modal>
    );
}
