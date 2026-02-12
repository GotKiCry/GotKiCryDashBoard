import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const ANIMATION_DURATION = 200; // ms, must match CSS

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    const modalRef = useRef(null);
    const [visible, setVisible] = useState(false); // controls DOM presence
    const [closing, setClosing] = useState(false);  // controls exit animation class

    // Trigger close animation, then actually unmount
    const handleClose = useCallback(() => {
        if (closing) return; // prevent double-close
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setVisible(false);
            onClose();
        }, ANIMATION_DURATION);
    }, [onClose, closing]);

    // Sync visibility with isOpen prop
    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setClosing(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') handleClose();
        };

        if (visible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [visible, handleClose]);

    // Close on click outside
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleClose();
        }
    };

    if (!visible) return null;

    const overlayClass = `modal-overlay ${closing ? 'modal-closing' : ''}`;
    const contentClass = `modal-content ${closing ? 'modal-content-closing' : ''}`;

    return createPortal(
        <div className={overlayClass} onClick={handleBackdropClick}>
            <div className={contentClass} ref={modalRef}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    {footer}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
