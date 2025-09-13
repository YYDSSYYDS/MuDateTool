// 全局变量存储道具数据
let itemsData = [];
let categoriesData = [];
let monstersData = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadItemData();
    loadMonsterData();
});

// 加载XML数据
async function loadItemData() {
    try {
        showLoading();
        const response = await fetch('ItemList.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        parseXMLData(xmlDoc);
        hideLoading();
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败，请检查ItemList.xml文件是否存在');
    }
}

// 加载怪物数据
async function loadMonsterData() {
    try {
        const response = await fetch('MonsterList.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        monstersData = [];
        const monsters = xmlDoc.querySelectorAll('Monster');
        
        monsters.forEach(monster => {
            const monsterData = {
                id: parseInt(monster.getAttribute('ID')) || 0,
                name: monster.getAttribute('Name') || '',
                level: parseInt(monster.getAttribute('Level')) || 1,
                hp: parseInt(monster.getAttribute('HP')) || 0,
                mp: parseInt(monster.getAttribute('MP')) || 0,
                ac: parseInt(monster.getAttribute('AC')) || 0,
                mac: parseInt(monster.getAttribute('MAC')) || 0,
                dc: parseInt(monster.getAttribute('DC')) || 0,
                mc: parseInt(monster.getAttribute('MC')) || 0,
                sc: parseInt(monster.getAttribute('SC')) || 0,
                speed: parseInt(monster.getAttribute('Speed')) || 0,
                experience: parseInt(monster.getAttribute('Experience')) || 0,
                agility: parseInt(monster.getAttribute('Agility')) || 0,
                accuracy: parseInt(monster.getAttribute('Accuracy')) || 0,
                canPush: monster.getAttribute('CanPush') === 'TRUE',
                canTame: monster.getAttribute('CanTame') === 'TRUE',
                targetDead: monster.getAttribute('TargetDead') === 'TRUE',
                escapeIgnoreBlock: monster.getAttribute('EscapeIgnoreBlock') === 'TRUE',
                autoRev: monster.getAttribute('AutoRev') === 'TRUE',
                undead: monster.getAttribute('Undead') === 'TRUE'
            };
            monstersData.push(monsterData);
        });
        
        console.log(`加载了 ${monstersData.length} 个怪物数据`);
    } catch (error) {
        console.error('加载怪物数据失败:', error);
        showError('加载怪物数据失败，请检查 MonsterList.xml 文件是否存在');
    }
}

// 解析XML数据
function parseXMLData(xmlDoc) {
    const categories = xmlDoc.querySelectorAll('Category');
    itemsData = [];
    categoriesData = [];
    
    categories.forEach(category => {
        const categoryIndex = parseInt(category.getAttribute('Index'));
        const categoryName = category.getAttribute('Name');
        
        categoriesData.push({
            index: categoryIndex,
            name: categoryName,
            items: []
        });
        
        const items = category.querySelectorAll('Item');
        items.forEach(item => {
            const itemIndex = parseInt(item.getAttribute('Index'));
            const itemName = item.getAttribute('Name');
            const totalId = categoryIndex * 512 + itemIndex;
            
            const itemData = {
                majorCategory: categoryIndex,
                majorCategoryName: categoryName,
                minorCategory: itemIndex,
                itemName: itemName,
                totalId: totalId
            };
            
            itemsData.push(itemData);
            categoriesData[categoriesData.length - 1].items.push(itemData);
        });
    });
    
    console.log(`加载了 ${itemsData.length} 个道具数据`);
}

// 按类别查询
function searchByCategory() {
    console.log('searchByCategory called');
    
    // 检查数据是否已加载
    if (!itemsData || itemsData.length === 0) {
        console.log('Items data not loaded yet');
        displayResults([]);
        return;
    }
    
    const majorCategory = document.getElementById('category-input').value.trim();
    const minorCategory = document.getElementById('subcategory-input').value.trim();
    console.log('Category search:', majorCategory, minorCategory);
    console.log('Items data length:', itemsData.length);
    
    if (!majorCategory && !minorCategory) {
        displayResults([]);
        return;
    }
    
    let results = itemsData.filter(item => {
        let match = true;
        
        // 如果输入了大类，必须匹配
        if (majorCategory) {
            const majorCat = parseInt(majorCategory);
            if (isNaN(majorCat) || item.majorCategory !== majorCat) {
                match = false;
            }
        }
        
        // 如果输入了小类，必须匹配
        if (minorCategory) {
            const minorCat = parseInt(minorCategory);
            if (isNaN(minorCat) || item.minorCategory !== minorCat) {
                match = false;
            }
        }
        
        return match;
    });
    
    console.log('Category search results:', results.length);
    
    const formattedResults = results.map(item => ({
        id: item.totalId,
        name: item.itemName,
        category: `${item.majorCategory} - ${item.majorCategoryName}`,
        subcategory: item.minorCategory,
        details: `总编号: ${item.totalId}`
    }));
    
    displayResults(formattedResults);
}

// 按编号查询
function searchById() {
    const itemId = document.getElementById('item-id').value.trim();
    
    if (!itemId) {
        displayResults([]);
        return;
    }
    
    const id = parseInt(itemId);
    const item = itemsData.find(item => item.totalId === id);
    
    if (item) {
        const result = [{
            id: item.totalId,
            name: item.itemName,
            category: `${item.majorCategory} - ${item.majorCategoryName}`,
            subcategory: item.minorCategory,
            details: `大类: ${item.majorCategory}, 小类: ${item.minorCategory}`
        }];
        displayResults(result);
    } else {
        displayResults([]);
    }
}

// 按名称查询
function searchByName() {
    console.log('searchByName called');
    const itemName = document.getElementById('item-name').value.trim();
    console.log('Name search:', itemName);
    
    if (!itemName) {
        displayResults([]);
        return;
    }
    
    const results = itemsData.filter(item => 
        item.itemName.toLowerCase().includes(itemName.toLowerCase())
    );
    
    const formattedResults = results.map(item => ({
        id: item.totalId,
        name: item.itemName,
        category: `${item.majorCategory} - ${item.majorCategoryName}`,
        subcategory: item.minorCategory,
        details: `总编号: ${item.totalId}`
    }));
    
    displayResults(formattedResults);
}

// 怪物查询功能
function searchMonster() {
    console.log('searchMonster called');
    const monsterId = document.getElementById('monster-id').value.trim();
    const monsterName = document.getElementById('monster-name').value.trim();
    const monsterLevel = document.getElementById('monster-level').value.trim();
    console.log('Monster search:', monsterId, monsterName, monsterLevel);
    
    if (!monsterId && !monsterName && !monsterLevel) {
        displayResults([]);
        return;
    }
    
    let results = monstersData.filter(monster => {
        let match = true;
        
        if (monsterId && monster.id !== parseInt(monsterId)) {
            match = false;
        }
        
        if (monsterName && !monster.name.toLowerCase().includes(monsterName.toLowerCase())) {
            match = false;
        }
        
        if (monsterLevel && monster.level !== parseInt(monsterLevel)) {
            match = false;
        }
        
        return match;
    });
    
    // 转换为显示格式
    const formattedResults = results.map(monster => ({
        id: monster.id,
        name: monster.name,
        category: '怪物',
        subcategory: `等级 ${monster.level}`,
        details: `HP: ${monster.hp}, MP: ${monster.mp}, AC: ${monster.ac}, MAC: ${monster.mac}, 经验: ${monster.experience}`
    }));
    
    displayResults(formattedResults);
}

// 切换标签页
function switchTab(tabName) {
    // 隐藏所有标签页内容
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有按钮的active类
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // 显示选中的标签页
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 激活对应的按钮
    event.target.classList.add('active');
    
    // 清空结果
    displayResults([]);
    
    // 清空输入框
    if (tabName === 'monster') {
        document.getElementById('monster-id').value = '';
        document.getElementById('monster-name').value = '';
        document.getElementById('monster-level').value = '';
    } else if (tabName === 'category') {
        document.getElementById('category-input').value = '';
        document.getElementById('subcategory-input').value = '';
    } else if (tabName === 'id') {
        document.getElementById('item-id').value = '';
    } else if (tabName === 'name') {
        document.getElementById('item-name').value = '';
    }
}

// 显示结果
function displayResults(results) {
    console.log('displayResults called with:', results.length, 'results');
    const resultsContainer = document.getElementById('results-container');
    
    if (!resultsContainer) {
        console.error('Results container not found!');
        return;
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">暂无匹配结果</div>';
        return;
    }
    
    let html = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>编号/ID</th>
                    <th>名称</th>
                    <th>类别</th>
                    <th>子类别</th>
                    <th>详细信息</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach(result => {
        html += `
            <tr>
                <td>${result.id}</td>
                <td>${result.name}</td>
                <td>${result.category}</td>
                <td>${result.subcategory}</td>
                <td>${result.details}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div class="results-count">共找到 ${results.length} 条结果</div>
    `;
    
    resultsContainer.innerHTML = html;
}

// 显示加载状态
function showLoading() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div class="loading">正在加载数据...</div>';
}

// 隐藏加载状态
function hideLoading() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div class="no-results">请选择查询方式并输入查询条件</div>';
}

// 显示错误信息
function showError(message) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}

// 清空结果
function clearResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div class="no-results">请选择查询方式并输入查询条件</div>';
    
    // 隐藏结果头部
    const resultsHeader = document.querySelector('.results-header');
    if (resultsHeader) {
        resultsHeader.style.display = 'none';
    }
}