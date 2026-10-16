import { getStoredData, saveStoredData, mergeImportedData } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const checklistContainer = document.getElementById('export-checklist-container');
    const exportBtn = document.getElementById('export-json-btn');
    const importFileInput = document.getElementById('import-file-input');
    const modal = document.getElementById('lth-modal');
    const modalBody = document.getElementById('modal-body');

    async function renderChecklist() {
        if (!checklistContainer) return;
        const data = await getStoredData();
        checklistContainer.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            checklistContainer.innerHTML = '<p>No data available to export.</p>';
            return;
        }

        data.forEach((category, catIndex) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'checklist-group';

            let toolsHTML = category.tools.map((tool, toolIndex) => `
                <label class="checklist-item" title="${tool.name}">
                    <input type="checkbox" class="tool-checkbox" data-cat-index="${catIndex}" data-tool-index="${toolIndex}" checked>
                    <span style="overflow: hidden; text-overflow: ellipsis;">${tool.name}</span>
                </label>
            `).join('');

            groupEl.innerHTML = `
                <div class="checklist-group-header">
                    <h2>📁 ${category.name}</h2>
                    <button type="button" class="cat-select-all-btn" data-cat-index="${catIndex}">Select All/Deselect All</button>
                </div>
                <div class="checklist-tools">
                    ${toolsHTML || '<p style="font-size:0.8rem; color:var(--text-muted); margin:0;">No items available.</p>'}
                </div>
            `;
            checklistContainer.appendChild(groupEl);
        });

        document.querySelectorAll('.cat-select-all-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const groupCard = btn.closest('.checklist-group');
                const checkboxes = groupCard.querySelectorAll('.tool-checkbox');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => cb.checked = !allChecked);
            });
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const data = await getStoredData();
            const checkboxes = document.querySelectorAll('.tool-checkbox:checked');
            
            if (checkboxes.length === 0) {
                if (modal && modalBody) {
                    modalBody.innerHTML = `
                        <div class="modal-form-container" style="text-align: center; padding: 10px;">
                            <span class="lth-modal-tag" style="background-color: #DC2626; color: #FFFFFF;">Warning</span>
                            <h2 style="margin: 15px 0 10px 0;">Selection Required</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Please select at least one item to export.</p>
                            <button id="close-warning-btn" class="lth-button lth-button-model1">Got it</button>
                        </div>
                    `;
                    modal.showModal();
                    document.getElementById('close-warning-btn').onclick = () => modal.close();
                }
                return;
            }

            const exportData = [];
            checkboxes.forEach(cb => {
                const catIdx = cb.dataset.catIndex;
                const toolIdx = cb.dataset.toolIndex;
                const sourceCat = data[catIdx];
                const sourceTool = sourceCat.tools[toolIdx];

                let targetCat = exportData.find(c => c.id === sourceCat.id);
                if (!targetCat) {
                    targetCat = { id: sourceCat.id, name: sourceCat.name, tools: [] };
                    exportData.push(targetCat);
                }
                targetCat.tools.push(sourceTool);
            });

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `lifetools-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (!Array.isArray(importedData)) throw new Error("Invalid format");

                    const currentData = await getStoredData();
                    const cleanData = mergeImportedData(currentData, importedData);
                    saveStoredData(cleanData);

                    let toast = document.getElementById('lth-toast-notification');
                    if (!toast) {
                        toast = document.createElement('div');
                        toast.id = 'lth-toast-notification';
                        document.body.appendChild(toast);
                    }

                    toast.style.cssText = `
                        position: fixed;
                        inset: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: rgba(0, 0, 0, 0.4);
                        z-index: 9999;
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;
                    `;

                    toast.innerHTML = `
                        <div style="
                            background-color: var(--bg-surface, #1e293b);
                            color: var(--text-main, #f8fafc);
                            padding: 20px 30px;
                            border-radius: 12px;
                            border: 1px solid var(--accent-green, #10B981);
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
                            font-size: 1.05rem;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            max-width: 90%;
                            text-align: center;
                        ">
                            <span style="font-size: 1.3rem;">✅</span> 
                            <span>Your backup file has been successfully loaded!</span>
                        </div>
                    `;

                    setTimeout(() => { toast.style.opacity = '1'; }, 10);

                    setTimeout(() => {
                        toast.style.opacity = '0';
                        setTimeout(() => {
                            if (toast) toast.remove();
                            window.location.href = 'resources.html';
                        }, 300);
                    }, 1200);

                } catch (error) {
                    if (modal && modalBody) {
                        modalBody.innerHTML = `
                            <div class="modal-form-container" style="text-align: center; padding: 10px;">
                                <span class="lth-modal-tag" style="background-color: #DC2626; color: #FFFFFF;">Error</span>
                                <h2 style="margin: 15px 0 10px 0;">Import Failed</h2>
                                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Error parsing JSON file. Please ensure it's a valid Life Tools Hub backup.</p>
                                <button id="close-error-btn" class="lth-button lth-button-model1">Try Again</button>
                            </div>
                        `;
                        modal.showModal();
                        document.getElementById('close-error-btn').onclick = () => modal.close();
                    }
                    console.error(error);
                }
                importFileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    renderChecklist();
});