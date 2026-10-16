export async function getStoredData() {
    const stored = localStorage.getItem('lifeToolsData');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error("Error parsing localStorage data", e);
        }
    }

    try {
        const response = await fetch('data/resources.json');
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        saveStoredData(data);
        return data;
    } catch (error) {
        console.error("Failed to load initial JSON database:", error);
        return [];
    }
}

export function saveStoredData(data) {
    localStorage.setItem('lifeToolsData', JSON.stringify(data));
}

export function mergeImportedData(currentData, importedData) {
    let merged = JSON.parse(JSON.stringify(currentData));

    importedData.forEach(importedCat => {
        importedCat.tools.forEach(importedTool => {
            merged.forEach(cat => {
                cat.tools = cat.tools.filter(t => t.id !== importedTool.id && t.url !== importedTool.url);
            });
        });
    });

    importedData.forEach(importedCat => {
        let targetCat = merged.find(c => c.id === importedCat.id);

        if (!targetCat) {
            targetCat = {
                id: importedCat.id,
                name: importedCat.name || importedCat.id,
                tools: [],
                isHidden: importedCat.isHidden || false
            };
            merged.push(targetCat);
        } else if (importedCat.name) {
            targetCat.name = importedCat.name;
        }

        importedCat.tools.forEach(importedTool => {
            if (!targetCat.tools.some(t => t.id === importedTool.id || t.url === importedTool.url)) {
                targetCat.tools.push(importedTool);
            }
        });
    });

    return merged;
}