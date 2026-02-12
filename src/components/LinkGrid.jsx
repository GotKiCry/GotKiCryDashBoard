import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store';
import EditShortcutModal from './EditShortcutModal';
import './LinkGrid.css';

// DnD Kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper: Convert Image URL to Base64
const fetchIconAsBase64 = async (url) => {
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('CORS or Network error, falling back to URL:', error);
        return null;
    }
};

// Helper: Get Icon Sources
// Strategy: Vector (SimpleIcons) -> Google Favicon (Reliable Fallback) -> Letter
const getIconSources = (url) => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // 1. Estimate Brand Slug for SimpleIcons
        const parts = hostname.split('.');
        let name = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        // Handle common TLDs like co.uk
        if (['co', 'com', 'org', 'net', 'edu', 'gov'].includes(name) && parts.length > 2) {
            name = parts[parts.length - 3];
        }

        // SimpleIcons CDN
        const vectorIcon = `https://cdn.simpleicons.org/${name}`;

        // Unified Fallback (Google Favicon API - very reliable)
        const fallbackIcon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

        return [vectorIcon, fallbackIcon];
    } catch {
        return [];
    }
};

// --- Sortable Item Component ---
const SortableLinkItem = ({ link, onDelete, updateShortcut, onContextMenu }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    // Use cached values if available
    const [currentIcon, setCurrentIcon] = useState(link.cachedIcon || null);
    const [useLetter, setUseLetter] = useState(false);

    // Memoize sources
    const sources = React.useMemo(() => getIconSources(link.url), [link.url]);

    // Icon Fetching Logic
    useEffect(() => {
        // 1. If we have a cached icon that works, use it and stop.
        if (link.cachedIcon) {
            return;
        }

        let isMounted = true;
        let activeIndex = 0;

        const tryLoadIcon = async () => {
            if (activeIndex >= sources.length) {
                // All sources failed
                if (isMounted) setUseLetter(true);
                return;
            }

            const src = sources[activeIndex];
            const img = new Image();
            img.src = src;

            img.onload = async () => {
                if (!isMounted) return;
                // Success!
                // Try to convert to Base64 for persistence
                const base64 = await fetchIconAsBase64(src);
                const finalIcon = base64 || src;

                setCurrentIcon(finalIcon);
                // Cache it so we don't request again
                updateShortcut(link.id, { cachedIcon: finalIcon });
            };

            img.onerror = () => {
                if (!isMounted) return;
                // Failed, try next
                activeIndex++;
                tryLoadIcon();
            };
        };

        tryLoadIcon();

        return () => { isMounted = false; };
    }, [link.url, link.id, link.cachedIcon, updateShortcut, sources]);


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    const initial = link.title ? link.title.charAt(0).toUpperCase() : '?';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="link-card-wrapper"
        >
            <a
                href={link.url}
                className="link-card"
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onClick={(e) => {
                    if (isDragging) e.preventDefault();
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu && onContextMenu(e, link);
                }}
            >
                {/* No background color, transparent container */}
                <div className="link-icon">
                    {!useLetter && currentIcon ? (
                        <img
                            src={currentIcon}
                            alt={link.title}
                            className="link-favicon"
                            draggable={false}
                        />
                    ) : (
                        <span className="link-icon-letter">{initial}</span>
                    )}
                </div>
                <span className="link-title">{link.title}</span>
            </a>
            <button
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(link.id);
                }}
                onPointerDown={e => e.stopPropagation()}
                title="移除"
            >
                &times;
            </button>
        </div >
    );
};

// --- Overlay Card Component ---
const OverlayCard = ({ link }) => {
    const initial = link.title ? link.title.charAt(0).toUpperCase() : '?';

    return (
        <div className="link-card dragging-overlay">
            <div className="link-icon">
                {link.cachedIcon ? (
                    <img
                        src={link.cachedIcon}
                        alt={link.title}
                        className="link-favicon"
                    />
                ) : (
                    <span className="link-icon-letter-overlay">{initial}</span>
                )}
            </div>
            <span className="link-title">{link.title}</span>
        </div>
    );
};

export default function LinkGrid() {
    const { shortcuts, addShortcut, removeShortcut, updateShortcut, setShortcuts } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null); // Data for the modal
    const [activeId, setActiveId] = useState(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, linkId: null });

    // Handle Context Menu (Right Click)
    const handleContextMenu = (e, link) => {
        e.preventDefault(); // redundant but safe
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            linkId: link.id,
            link: link // pass full link object for convenience
        });
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, linkId: null });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Menu Actions
    const handleOpen = () => {
        if (contextMenu.link) {
            window.open(contextMenu.link.url, '_blank');
        }
    };

    const handleEdit = () => {
        if (contextMenu.link) {
            setEditingLink(contextMenu.link);
            setIsModalOpen(true);
        }
    };

    const handleRefresh = () => {
        if (contextMenu.linkId) {
            // Clear cached icon to trigger re-fetch in SortableLinkItem
            updateShortcut(contextMenu.linkId, { cachedIcon: null });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = shortcuts.findIndex((item) => item.id === active.id);
            const newIndex = shortcuts.findIndex((item) => item.id === over.id);
            const newOrder = arrayMove(shortcuts, oldIndex, newIndex);
            setShortcuts(newOrder);
        }
        setActiveId(null);
    };

    const activeItem = shortcuts.find(s => s.id === activeId);

    return (
        <div className="link-grid-container" style={{ width: '100%' }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="link-grid">
                    <SortableContext
                        items={shortcuts.map(s => s.id)}
                        strategy={rectSortingStrategy}
                    >
                        {shortcuts.map((link) => (
                            <SortableLinkItem
                                key={link.id}
                                link={link}
                                onDelete={removeShortcut}
                                updateShortcut={updateShortcut}
                                onContextMenu={handleContextMenu}
                            />
                        ))}
                    </SortableContext>

                    <button className="link-card add-new" onClick={() => {
                        setEditingLink(null);
                        setIsModalOpen(true);
                    }}>
                        <div className="link-icon">+</div>
                        <span className="link-title">添加</span>
                    </button>
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={null}>
                        {activeItem ? <OverlayCard link={activeItem} /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Context Menu */}
            {/* Context Menu */}
            {contextMenu.visible && createPortal(
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu itself
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <button className="context-menu-item" onClick={() => { handleOpen(); setContextMenu({ ...contextMenu, visible: false }); }}>
                        打开
                    </button>
                    <button className="context-menu-item" onClick={() => { handleEdit(); setContextMenu({ ...contextMenu, visible: false }); }}>
                        编辑
                    </button>
                    <button className="context-menu-item" onClick={() => { handleRefresh(); setContextMenu({ ...contextMenu, visible: false }); }}>
                        刷新图标
                    </button>
                </div>,
                document.body
            )}

            <EditShortcutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data, id) => {
                    if (id) {
                        updateShortcut(id, data);
                    } else {
                        addShortcut(data);
                    }
                }}
                initialData={editingLink}
            />
        </div>
    );
}
