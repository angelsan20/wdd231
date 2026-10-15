document.addEventListener('DOMContentLoaded', () => {

    async function getStoredData() {
        if (typeof window.getStoredData === 'function') {
            return await window.getStoredData();
        }
        const stored = localStorage.getItem('lifeToolsData');
        let parsed = [];
        try { parsed = stored ? JSON.parse(stored) : []; } catch(e) {}
        return Array.isArray(parsed) ? parsed : [];
    }

    function saveStoredData(data) {
        localStorage.setItem('lifeToolsData', JSON.stringify(data));
    }

    const container = document.getElementById('categories-container');
    const modal = document.getElementById('resource-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addCategoryBtn = document.getElementById('add-category-btn');

    async function renderDirectory() {
        if (!container) return;
        
        renderTopManagerButton();

        const data = await getStoredData();
        container.innerHTML = '';

        if (!Array.isArray(data)) return;

        data.forEach(category => {
            if (category.isHidden) return;

            const categoryEl = document.createElement('section');
            categoryEl.className = 'category-card-column';

            const visibleTools = (category.tools || []).filter(t => !t.isHidden);
            const sortedTools = [...visibleTools].sort((a, b) => (b.isFavorite || 0) - (a.isFavorite || 0));

            let toolsHTML = sortedTools.map(tool => {
                let domain = "example.com";
                try { domain = new URL(tool.url).hostname; } catch(err) {}
                const logoSrc = tool.logo || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                const customBadge = tool.isCustom ? `<span class="tool-badge-custom" title="Created by user">Custom</span>` : '';
                return `
                    <article class="resource-og-card ${tool.isFavorite ? 'favorite-active' : ''}" data-id="${tool.id}" data-cat="${category.id}">
                        <div class="og-card-logo-container">
                            <img src="${logoSrc}" alt="${tool.name} logo" class="og-card-logo" loading="lazy">
                        </div>
                        <div class="og-card-content">
                            <div class="og-card-top">
                                <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                                    <a href="${tool.url}" target="_blank" rel="noopener" class="og-card-title">${tool.name}</a>
                                    ${customBadge}
                                </div>
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    <button class="hide-tool-btn" aria-label="Hide tool" title="Hide this tool">👁️‍🗨️</button>
                                    <button class="favorite-icon-btn" aria-label="Toggle favorite" title="Star this tool">
                                        ${tool.isFavorite ? '❤️' : '🤍'}
                                    </button>
                                </div>
                            </div>
                            <p class="og-card-desc">${tool.desc}</p>
                        </div>
                    </article>
                `;
            }).join('');

            const isDefaultCategory = ['programming', 'fitness', 'cooking', 'entertainment'].includes(category.id);
            
            let menuItemsHTML = `
                <button class="dropdown-item-btn add-tool-btn" data-cat="${category.id}">+ New Page</button>
                <button class="dropdown-item-btn hide-cat-btn" data-cat="${category.id}">Hide</button>
                <button class="dropdown-item-btn move-cat-pos-btn" data-cat="${category.id}">↔️ Move Position</button>
            `;

            if (!isDefaultCategory) {
                menuItemsHTML += `
                    <button class="dropdown-item-btn edit-cat-btn" data-cat="${category.id}">✏️ Edit Name</button>
                    <button class="dropdown-item-btn delete-cat-btn" data-cat="${category.id}" style="color: #DC2626;">🗑️ Delete Category</button>
                `;
            }

            categoryEl.innerHTML = `
                <div class="category-card-header">
                    <h2>${category.name}</h2>
                    <div class="category-menu-container">
                        <button class="cat-menu-toggle-btn" aria-label="Category menu" title="Options">•••</button>
                        <div class="category-dropdown-menu">
                            ${menuItemsHTML}
                        </div>
                    </div>
                </div>
                <div class="category-scroll-box">
                    ${toolsHTML || '<p class="no-tools">No visible tools available.</p>'}
                </div>
            `;

            container.appendChild(categoryEl);
        });

        attachCardEvents();
    }

    function renderTopManagerButton() {
        const actionsContainer = document.querySelector('.directory-actions');
        if (!actionsContainer) return;

        let managerBtn = document.getElementById('open-manager-modal');
        if (!managerBtn) {
            managerBtn = document.createElement('button');
            managerBtn.id = 'open-manager-modal';
            managerBtn.className = 'btn btn-secondary btn-top-action';
            actionsContainer.appendChild(managerBtn);
        }
        managerBtn.innerHTML = 'Visibility Manager';

        actionsContainer.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('btn-top-action');
        });

        managerBtn.onclick = async () => {
            const data = await getStoredData();
            if (!Array.isArray(data)) return;
            
            const hiddenCats = data.filter(c => c.isHidden);
            const catsWithHiddenTools = data.filter(c => !c.isHidden && (c.tools || []).some(t => t.isHidden));

            const hasHiddenItems = hiddenCats.length > 0 || catsWithHiddenTools.length > 0;

            let managerHTML = `<div class="modal-form-container">
                <span class="modal-badge">Visibility Manager</span>
                <h2 style="margin: 10px 0 5px 0;">Hidden Items Manager</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Review and restore categories or pages you previously hid.</p>`;

            if (!hasHiddenItems) {
                managerHTML += `
                    <div style="padding: 25px 15px; text-align: center; background: var(--bg-primary); border-radius: 8px; border: 1px dashed var(--border-color); margin-top: 10px;">
                        <p style="margin: 0; font-weight: 600; color: var(--text-muted);">There are currently no hidden categories or pages.</p>
                    </div>
                </div>`;
            } else {
                managerHTML += `<div style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; text-align: left;">`;

                hiddenCats.forEach(cat => {
                    managerHTML += `<div class="manager-category-item" style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; background: var(--bg-primary); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; font-size: 0.9rem;">📁 ${cat.name} <em>(Hidden Category)</em></span>
                        <button class="btn btn-secondary toggle-cat-vis" data-cat="${cat.id}" style="padding: 4px 10px; font-size: 0.8rem;">
                            Show Category
                        </button>
                    </div>`;
                });

                catsWithHiddenTools.forEach((cat, index) => {
                    const hiddenTools = (cat.tools || []).filter(t => t.isHidden);
                    managerHTML += `<div class="manager-category-item" style="border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
                        <div class="manager-cat-header" data-target="cat-tools-${index}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--bg-primary); cursor: pointer; user-select: none;">
                            <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 0.9rem;">
                                <span class="collapse-arrow">▶</span>
                                <span>📁 ${cat.name} (${hiddenTools.length} hidden)</span>
                            </div>
                        </div>
                        <ul id="cat-tools-${index}" style="list-style: none; padding: 0 12px; margin: 0; display: none; flex-direction: column; gap: 6px; background: var(--bg-surface); border-top: 1px solid var(--border-color);">`;
                    
                    hiddenTools.forEach(tool => {
                        const customBadge = tool.isCustom ? `<span class="tool-badge-custom" style="margin-left: 6px;">Custom</span>` : '';
                        managerHTML += `<li style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                            <span style="display: flex; align-items: center;">🔹 ${tool.name} ${customBadge}</span>
                            <button class="btn btn-secondary toggle-tool-vis" data-cat="${cat.id}" data-tool="${tool.id}" style="padding: 3px 8px; font-size: 0.75rem;">
                                Show Page
                            </button>
                        </li>`;
                    });
                    managerHTML += `</ul></div>`;
                });

                managerHTML += `</div></div>`;
            }

            modalBody.innerHTML = managerHTML;
            modal.showModal();

            modalBody.querySelectorAll('.manager-cat-header').forEach(header => {
                header.addEventListener('click', () => {
                    const targetId = header.dataset.target;
                    const listEl = document.getElementById(targetId);
                    const arrowEl = header.querySelector('.collapse-arrow');
                    
                    if (listEl.style.display === 'none' || listEl.style.display === '') {
                        listEl.style.display = 'flex';
                        arrowEl.textContent = '▼';
                    } else {
                        listEl.style.display = 'none';
                        arrowEl.textContent = '▶';
                    }
                });
            });

            modalBody.querySelectorAll('.toggle-cat-vis').forEach(b => {
                b.onclick = async () => {
                    const cId = b.dataset.cat;
                    const d = await getStoredData();
                    const c = d.find(x => x.id === cId);
                    if(c) { c.isHidden = false; saveStoredData(d); modal.close(); renderDirectory(); }
                };
            });

            modalBody.querySelectorAll('.toggle-tool-vis').forEach(b => {
                b.onclick = async () => {
                    const cId = b.dataset.cat;
                    const tId = b.dataset.tool;
                    const d = await getStoredData();
                    const c = d.find(x => x.id === cId);
                    const t = (c?.tools || []).find(x => x.id === tId);
                    if(t) { t.isHidden = false; saveStoredData(d); modal.close(); renderDirectory(); }
                };
            });
        };
    }

    function attachCardEvents() {
        document.querySelectorAll('.cat-menu-toggle-btn').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.category-dropdown-menu').forEach(m => {
                    if (m !== toggleBtn.nextElementSibling) m.classList.remove('show');
                });
                const menu = toggleBtn.nextElementSibling;
                menu.classList.toggle('show');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.category-dropdown-menu').forEach(m => m.classList.remove('show'));
        });

        document.querySelectorAll('.move-cat-pos-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const catId = btn.dataset.cat;
                const data = await getStoredData();
                const catIndex = data.findIndex(c => c.id === catId);
                if (catIndex === -1) return;

                const category = data[catIndex];

                if (modal && modalBody) {
                    let positionOptionsHTML = data.map((c, idx) => `
                        <option value="${idx}" ${idx === catIndex ? 'selected' : ''}>Position ${idx + 1}: ${c.name}</option>
                    `).join('');

                    modalBody.innerHTML = `
                        <div class="modal-form-container" style="padding: 10px;">
                            <span class="modal-badge">Reorder Category</span>
                            <h2 style="margin: 15px 0 10px 0;">Move Category Position</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
                                Choose the new display position for <strong>"${category.name}"</strong>:
                            </p>
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="target-pos-select" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; display: block;">Target Position:</label>
                                <select id="target-pos-select" class="form-group select" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-main); font-size: 0.95rem;">
                                    ${positionOptionsHTML}
                                </select>
                            </div>
                            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button id="confirm-move-cat-pos" class="btn btn-primary">Apply Position</button>
                                <button id="cancel-move-cat-pos" class="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    `;
                    modal.showModal();

                    document.getElementById('cancel-move-cat-pos').onclick = () => modal.close();
                    document.getElementById('confirm-move-cat-pos').onclick = async () => {
                        const newIndex = parseInt(document.getElementById('target-pos-select').value);
                        if (newIndex !== catIndex) {
                            data.splice(catIndex, 1);
                            data.splice(newIndex, 0, category);
                            saveStoredData(data);
                        }
                        modal.close();
                        renderDirectory();
                    };
                }
            });
        });

        document.querySelectorAll('.edit-cat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const catId = btn.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                if (!category) return;

                if (modal && modalBody) {
                    modalBody.innerHTML = `
                        <div class="modal-form-container" style="padding: 10px;">
                            <span class="modal-badge">Edit Category</span>
                            <h2 style="margin: 15px 0 15px 0;">Update Category Name</h2>
                            <form id="edit-cat-form" class="feedback-form">
                                <div class="form-group">
                                    <label for="edit-cat-name">Category Name *</label>
                                    <input type="text" id="edit-cat-name" required value="${category.name}" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-main);">
                                </div>
                                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                    <button type="button" id="cancel-edit-cat" class="btn btn-secondary">Cancel</button>
                                </div>
                            </form>
                        </div>
                    `;
                    modal.showModal();

                    document.getElementById('cancel-edit-cat').onclick = () => modal.close();
                    document.getElementById('edit-cat-form').onsubmit = async (e) => {
                        e.preventDefault();
                        const newName = document.getElementById('edit-cat-name').value.trim();
                        if (newName) {
                            category.name = newName;
                            saveStoredData(data);
                            modal.close();
                            renderDirectory();
                        }
                    };
                }
            });
        });

        document.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const catId = btn.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                if (!category) return;

                const count = (category.tools || []).length;

                if (modal && modalBody) {
                    modalBody.innerHTML = `
                        <div class="modal-form-container" style="text-align: center; padding: 10px;">
                            <span class="modal-badge">Delete Category</span>
                            <h2 style="margin: 15px 0 10px 0;">Are you sure?</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">
                                You are about to delete the category <strong>"${category.name}"</strong>. It has <strong>${count}</strong> registered link(s). Deleting it will remove all these links with it.
                            </p>
                            <div style="display: flex; gap: 10px; justify-content: center;">
                                <button id="confirm-del-cat" class="btn btn-primary" style="background-color: #DC2626; color: #FFFFFF;">Yes, Delete Category</button>
                                <button id="cancel-del-cat" class="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    `;
                    modal.showModal();

                    document.getElementById('cancel-del-cat').onclick = () => modal.close();
                    document.getElementById('confirm-del-cat').onclick = async () => {
                        const newData = data.filter(c => c.id !== catId);
                        saveStoredData(newData);
                        modal.close();
                        renderDirectory();
                    };
                }
            });
        });

        document.querySelectorAll('.hide-tool-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const card = btn.closest('.resource-og-card');
                const toolId = card.dataset.id;
                const catId = card.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                const tool = (category?.tools || []).find(t => t.id === toolId);
                if (tool) {
                    tool.isHidden = true;
                    saveStoredData(data);
                    renderDirectory();
                }
            });
        });

        document.querySelectorAll('.hide-cat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const catId = btn.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                if (category) {
                    category.isHidden = true;
                    saveStoredData(data);
                    renderDirectory();
                }
            });
        });

        document.querySelectorAll('.favorite-icon-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const card = btn.closest('.resource-og-card');
                const toolId = card.dataset.id;
                const catId = card.dataset.cat;

                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                if (category) {
                    const tool = (category.tools || []).find(t => t.id === toolId);
                    if (tool) {
                        tool.isFavorite = !tool.isFavorite;
                        saveStoredData(data);
                        renderDirectory();
                    }
                }
            });
        });

        document.querySelectorAll('.resource-og-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                if (e.target.tagName === 'A' || e.target.closest('button')) return;

                const toolId = card.dataset.id;
                const catId = card.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);
                const tool = (category?.tools || []).find(t => t.id === toolId);

                if (tool && modal && modalBody) {
                    let domain = "example.com";
                    try { domain = new URL(tool.url).hostname; } catch(err) {}
                    const logoSrc = tool.logo || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                    
                    let managementActionsHTML = `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                            <button id="open-edit-tool-modal-btn" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem;">Edit Page Details</button>
                            <button id="open-move-modal-btn" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem;">Move to another category</button>
                            ${tool.isCustom ? `<button id="modal-delete-tool-btn" class="btn btn-secondary" style="color: #DC2626; border-color: #DC2626; width: 100%; font-size: 0.85rem;">Delete Custom Page</button>` : ''}
                        </div>
                    `;

                    modalBody.innerHTML = `
                        <div class="modal-og-preview">
                            <span class="modal-badge">${category.name}</span>
                            <div class="modal-og-banner-centered">
                                <img src="${logoSrc}" alt="${tool.name}" class="modal-og-img">
                            </div>
                            <h2 style="margin-top: 15px; margin-bottom: 5px; text-align: center;">
                                ${tool.name} ${tool.isCustom ? '<span class="tool-badge-custom">Custom</span>' : ''}
                            </h2>
                            <p class="modal-desc" style="text-align: center;">${tool.desc}</p>
                            <span class="modal-url" style="text-align: center; display: block; margin-bottom: 10px;">${tool.url}</span>
                            
                            ${managementActionsHTML}

                            <div class="modal-footer-actions">
                                <a href="${tool.url}" target="_blank" rel="noopener" class="btn btn-primary">Visit Official Website &rarr;</a>
                                <div class="modal-quick-tools">
                                    <button id="modal-hide-btn" class="icon-btn-modal" title="Hide this page">👁️‍🗨️</button>
                                    <button id="modal-fav-btn" class="icon-btn-modal" title="Toggle Favorite">
                                        ${tool.isFavorite ? '❤️' : '🤍'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    modal.showModal();

                    document.getElementById('modal-fav-btn').onclick = async () => {
                        tool.isFavorite = !tool.isFavorite;
                        saveStoredData(data);
                        modal.close();
                        renderDirectory();
                    };

                    document.getElementById('modal-hide-btn').onclick = async () => {
                        tool.isHidden = true;
                        saveStoredData(data);
                        modal.close();
                        renderDirectory();
                    };

                    document.getElementById('open-edit-tool-modal-btn').onclick = () => {
                        let nameFieldHTML = tool.isCustom ? `
                            <div class="form-group">
                                <label for="edit-tool-name">Tool Name *</label>
                                <input type="text" id="edit-tool-name" required value="${tool.name}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-main);">
                            </div>
                        ` : `
                            <div class="form-group">
                                <label for="edit-tool-name">Tool Name (Official - Locked)</label>
                                <input type="text" id="edit-tool-name" disabled value="${tool.name}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--border-color); color: var(--text-muted); cursor: not-allowed;">
                            </div>
                        `;

                        modalBody.innerHTML = `
                            <div class="modal-form-container" style="padding: 10px;">
                                <span class="modal-badge">Edit Page</span>
                                <h2 style="margin: 10px 0 15px 0;">Update Page Details</h2>
                                <form id="edit-tool-form" class="feedback-form">
                                    ${nameFieldHTML}
                                    <div class="form-group">
                                        <label for="edit-tool-desc">Description *</label>
                                        <textarea id="edit-tool-desc" rows="3" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-main);">${tool.desc}</textarea>
                                    </div>
                                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
                                        <button type="submit" class="btn btn-primary">Save Changes</button>
                                        <button type="button" id="cancel-edit-tool" class="btn btn-secondary">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        `;

                        document.getElementById('cancel-edit-tool').onclick = () => modal.close();
                        document.getElementById('edit-tool-form').onsubmit = async (e) => {
                            e.preventDefault();
                            if (tool.isCustom) {
                                const newName = document.getElementById('edit-tool-name').value.trim();
                                if (newName) tool.name = newName;
                            }
                            const newDesc = document.getElementById('edit-tool-desc').value.trim();
                            if (newDesc) tool.desc = newDesc;

                            saveStoredData(data);
                            modal.close();
                            renderDirectory();
                        };
                    };

                    document.getElementById('open-move-modal-btn').onclick = () => {
                        let optionsHTML = data.map(c => `<option value="${c.id}" ${c.id === catId ? 'selected' : ''}>${c.name}</option>`).join('');
                        
                        modalBody.innerHTML = `
                            <div class="modal-form-container" style="text-align: center; padding: 10px;">
                                <span class="modal-badge">Reassign Category</span>
                                <h2 style="margin: 15px 0 10px 0;">Move Page</h2>
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
                                    Select the destination category for <strong>"${tool.name}"</strong>:
                                </p>
                                <div class="form-group" style="margin-bottom: 20px; text-align: left;">
                                    <label for="target-cat-select" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; display: block;">Destination Category:</label>
                                    <select id="target-cat-select" class="form-group select" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-main); font-size: 0.95rem;">
                                        ${optionsHTML}
                                    </select>
                                </div>
                                <div style="display: flex; gap: 10px; justify-content: center;">
                                    <button id="confirm-move-btn" class="btn btn-primary">Confirm Move</button>
                                    <button id="cancel-move-btn" class="btn btn-secondary">Cancel</button>
                                </div>
                            </div>
                        `;

                        document.getElementById('cancel-move-btn').onclick = () => modal.close();
                        document.getElementById('confirm-move-btn').onclick = async () => {
                            const newCatId = document.getElementById('target-cat-select').value;
                            if (newCatId !== catId) {
                                const targetCat = data.find(c => c.id === newCatId);
                                if (targetCat) {
                                    category.tools = category.tools.filter(t => t.id !== toolId);
                                    targetCat.tools.push(tool);
                                    saveStoredData(data);
                                }
                            }
                            modal.close();
                            renderDirectory();
                        };
                    };

                    if (tool.isCustom) {
                        document.getElementById('modal-delete-tool-btn').onclick = () => {
                            modalBody.innerHTML = `
                                <div class="modal-form-container" style="text-align: center; padding: 10px;">
                                    <span class="modal-badge">Delete Page</span>
                                    <h2 style="margin: 15px 0 10px 0;">Are you sure?</h2>
                                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">
                                        Are you sure you want to delete the custom page <strong>"${tool.name}"</strong>?
                                    </p>
                                    <div style="display: flex; gap: 10px; justify-content: center;">
                                        <button id="confirm-del-tool" class="btn btn-primary" style="background-color: #DC2626; color: #FFFFFF;">Yes, Delete Page</button>
                                        <button id="cancel-del-tool" class="btn btn-secondary">Cancel</button>
                                    </div>
                                </div>
                            `;

                            document.getElementById('cancel-del-tool').onclick = () => modal.close();
                            document.getElementById('confirm-del-tool').onclick = async () => {
                                category.tools = category.tools.filter(t => t.id !== toolId);
                                saveStoredData(data);
                                modal.close();
                                renderDirectory();
                            };
                        };
                    }
                }
            });
        });

        document.querySelectorAll('.add-tool-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const catId = btn.dataset.cat;
                const data = await getStoredData();
                const category = data.find(c => c.id === catId);

                if (category && modal && modalBody) {
                    modalBody.innerHTML = `
                        <div class="modal-form-container">
                            <span class="modal-badge">${category.name}</span>
                            <h2 style="margin-top: 10px; margin-bottom: 15px;">Add New Resource Page</h2>
                            <form id="add-tool-form" class="feedback-form">
                                <div class="form-group">
                                    <label for="new-tool-name">Tool Name *</label>
                                    <input type="text" id="new-tool-name" required placeholder="e.g. My Custom Page">
                                </div>
                                <div class="form-group">
                                    <label for="new-tool-url">Tool URL *</label>
                                    <input type="url" id="new-tool-url" required placeholder="https://example.com">
                                </div>
                                <div class="form-group">
                                    <label for="new-tool-desc">Description</label>
                                    <textarea id="new-tool-desc" rows="3" placeholder="Short summary of this tool..."></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Save Page</button>
                            </form>
                        </div>
                    `;

                    modal.showModal();

                    document.getElementById('add-tool-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const toolName = document.getElementById('new-tool-name').value.trim();
                        const toolUrl = document.getElementById('new-tool-url').value.trim();
                        const toolDesc = document.getElementById('new-tool-desc').value.trim();

                        let cleanDomain = "example.com";
                        try { cleanDomain = new URL(toolUrl).hostname; } catch(err) {}

                        category.tools.push({
                            id: 'tool-' + Date.now(),
                            name: toolName,
                            url: toolUrl,
                            desc: toolDesc || 'Custom user added resource.',
                            logo: `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`,
                            isFavorite: false,
                            isCustom: true,
                            isHidden: false
                        });

                        saveStoredData(data);
                        modal.close();
                        renderDirectory();
                    });
                }
            });
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => modal.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            if (modal && modalBody) {
                modalBody.innerHTML = `
                    <div class="modal-form-container">
                        <span class="modal-badge">Directory Customization</span>
                        <h2 style="margin-top: 10px; margin-bottom: 15px;">Add New Category</h2>
                        <form id="add-category-form" class="feedback-form">
                            <div class="form-group">
                                <label for="new-cat-name">Category Name *</label>
                                <input type="text" id="new-cat-name" required placeholder="e.g. Design & UI Tools">
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Create Category</button>
                        </form>
                    </div>
                `;

                modal.showModal();

                document.getElementById('add-category-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const catName = document.getElementById('new-cat-name').value.trim();
                    const catId = catName.toLowerCase().replace(/\s+/g, '-');

                    const data = await getStoredData();
                    if (!Array.isArray(data)) return;

                    if (data.some(c => c.id === catId)) {
                        alert("Category already exists!");
                        return;
                    }

                    data.push({
                        id: catId,
                        name: catName,
                        tools: [],
                        isHidden: false
                    });

                    saveStoredData(data);
                    modal.close();
                    renderDirectory();
                });
            }
        });
    }

    renderDirectory();
});