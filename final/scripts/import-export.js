document.addEventListener('DOMContentLoaded', () => {
    const checklistContainer = document.getElementById('export-checklist-container');
    const exportBtn = document.getElementById('export-json-btn');
    const importFileInput = document.getElementById('import-file-input');
    const modal = document.getElementById('resource-modal');
    const modalBody = document.getElementById('modal-body');

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
                const catIdx = btn.dataset.catIndex;
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
                            <span class="modal-badge" style="background-color: #DC2626; color: #FFFFFF;">Warning</span>
                            <h2 style="margin: 15px 0 10px 0;">Selection Required</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Please select at least one item to export.</p>
                            <button id="close-warning-btn" class="lth-btn lth-btn-primary">Got it</button>
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
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (!Array.isArray(importedData)) throw new Error("Invalid format");

                    saveStoredData(importedData);
                    renderChecklist();

                    if (modal && modalBody) {
                        modalBody.innerHTML = `
                            <div class="modal-form-container" style="text-align: center; padding: 10px;">
                                <span class="modal-badge">Success</span>
                                <h2 style="margin: 15px 0 10px 0;">Backup Imported Successfully</h2>
                                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Your data has been successfully imported and synced across your device.</p>
                                <button id="close-success-btn" class="lth-btn lth-btn-primary">Continue</button>
                            </div>
                        `;
                        modal.showModal();
                        document.getElementById('close-success-btn').onclick = () => modal.close();
                    }
                } catch (error) {
                    if (modal && modalBody) {
                        modalBody.innerHTML = `
                            <div class="modal-form-container" style="text-align: center; padding: 10px;">
                                <span class="modal-badge" style="background-color: #DC2626; color: #FFFFFF;">Error</span>
                                <h2 style="margin: 15px 0 10px 0;">Import Failed</h2>
                                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Error parsing JSON file. Please ensure it's a valid Life Tools Hub backup.</p>
                                <button id="close-error-btn" class="lth-btn lth-btn-primary">Try Again</button>
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