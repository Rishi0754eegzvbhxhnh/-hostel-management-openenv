import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FoodMenu.css';

const FoodMenu = () => {
    const navigate = useNavigate();
    const [foodPreference, setFoodPreference] = useState('');
    const [activeTab, setActiveTab] = useState('breakfast');
    const [language, setLanguage] = useState('English');

    const handlePreferenceChange = (pref) => {
        setFoodPreference(pref);
        alert(`Preference saved as ${pref}!`);
    };

    const handleTranslate = (targetLang) => {
        setLanguage(targetLang);
    };

    const upcomingHolidays = [
        { name: "Holi", date: "March 14, 2026", note: "Mess will serve special sweets & colors lunch" },
        { name: "Good Friday", date: "April 3, 2026", note: "Mess closed for dinner. Light snacks available." },
        { name: "Eid al-Fitr", date: "March 31, 2026", note: "Special Biryani & Sheer Khurma served at lunch" }
    ];

    const menu = {
        breakfast: [
            { name: "Idli & Sambar", desc: "Soft steamed rice cakes with lentil soup", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Idli_Sambar.jpg/640px-Idli_Sambar.jpg" },
            { name: "Masala Dosa", desc: "Crispy crepe filled with potato masala", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Masala_Dosa.jpg/640px-Masala_Dosa.jpg" },
            { name: "Poha", desc: "Flattened rice with peas and peanuts", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Poha_1.jpg/640px-Poha_1.jpg" },
            { name: "Aloo Paratha", desc: "Stuffed potato flatbread with curd", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Aloo_paratha_with_curd.jpg/640px-Aloo_paratha_with_curd.jpg" }
        ],
        lunch: [
            { name: "North Indian Thali", desc: "Roti, Rice, Dal, Paneer, Mixed Veg & Dessert", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/North_Indian_Thali.jpg/640px-North_Indian_Thali.jpg" },
            { name: "Chicken Biryani (Non-Veg)", desc: "Aromatic basmati rice cooked with spices and chicken", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Biryani_Chicken.jpg/640px-Biryani_Chicken.jpg" },
            { name: "Rajma Chawal", desc: "Kidney bean curry served with steamed rice", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rajma_chawal.jpg/640px-Rajma_chawal.jpg" },
            { name: "South Indian Meals", desc: "Rice, Sambar, Rasam, Poriyal, Appalam", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Sadya_on_banana_leaf.jpg/640px-Sadya_on_banana_leaf.jpg" }
        ],
        dinner: [
            { name: "Chapati & Paneer Butter Masala", desc: "Soft flatbreads with rich paneer gravy", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Butter_paneer_masala.jpg/640px-Butter_paneer_masala.jpg" },
            { name: "Fried Rice & Manchurian", desc: "Indo-Chinese style rice with veg balls in sauce", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Fried_rice_in_a_wok.jpg/640px-Fried_rice_in_a_wok.jpg" },
            { name: "Dal Tadka & Jeera Rice", desc: "Tempered yellow lentils with cumin rice", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Dal_fry_with_jeera_rice.jpg/640px-Dal_fry_with_jeera_rice.jpg" },
            { name: "Chicken Curry with Naan (Non-Veg)", desc: "Spiced chicken gravy with garlic flatbread", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chicken_curry.jpg/640px-Chicken_curry.jpg" }
        ]
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const tomorrowsSpecials = [
        { meal: "Breakfast", dish: "Chole Bhature", desc: "Fluffy fried bread with spicy chickpea curry", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chole_bhature.jpg/640px-Chole_bhature.jpg" },
        { meal: "Lunch", dish: "Mutton Biryani", desc: "Slow-cooked aromatic mutton biryani with raita", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Chicken-biryani-recipe.jpg/640px-Chicken-biryani-recipe.jpg" },
        { meal: "Dinner", dish: "Gulab Jamun & Kheer", desc: "Festival special — milk-based desserts", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Gulabjamuns.jpg/640px-Gulabjamuns.jpg" }
    ];

    const sideImages = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/North_Indian_Thali.jpg/480px-North_Indian_Thali.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Biryani_Chicken.jpg/480px-Biryani_Chicken.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Sadya_on_banana_leaf.jpg/480px-Sadya_on_banana_leaf.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Butter_paneer_masala.jpg/480px-Butter_paneer_masala.jpg"
    ];

    return (
        <div className="food-menu-page">
            <header className="menu-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Hostel Mess Menu</h1>
                <p>Delicious, hygienic, and nutritious meals prepared fresh every day.</p>
                <div className="translation-controls">
                    <span>Translate: </span>
                    <button onClick={() => handleTranslate('Hindi')} className={language === 'Hindi' ? 'active' : ''}>Hindi</button>
                    <button onClick={() => handleTranslate('Telugu')} className={language === 'Telugu' ? 'active' : ''}>Telugu</button>
                    <button onClick={() => handleTranslate('English')} className={language === 'English' ? 'active' : ''}>English</button>
                </div>
            </header>

            <div className="page-layout">
                <div className="side-panel left-panel">
                    {sideImages.slice(0, 2).map((src, i) => (
                        <div className="side-img-wrap" key={i}>
                            <img src={src} alt={`food-${i}`} />
                        </div>
                    ))}
                </div>

                <div className="menu-container">
                    <section className="tomorrows-special">
                        <div className="special-badge">⭐ Preview</div>
                        <h2>Tomorrow's Special — <span className="special-date">{tomorrowStr}</span></h2>
                        <p className="special-subtitle">Get excited! Here's what's coming up tomorrow in the hostel mess.</p>
                        <div className="specials-grid">
                            {tomorrowsSpecials.map((item, i) => (
                                <div className="special-card" key={i}>
                                    <div className="special-meal-tag">{item.meal}</div>
                                    <img src={item.img} alt={item.dish} />
                                    <div className="special-info">
                                        <h3>{item.dish}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="holiday-banner">
                        <h2>🎉 Upcoming Holidays & Mess Schedule</h2>
                        <div className="holiday-list">
                            {upcomingHolidays.map((h, i) => (
                                <div className="holiday-item" key={i}>
                                    <div className="holiday-info">
                                        <span className="holiday-name">{h.name}</span>
                                        <span className="holiday-date">📅 {h.date}</span>
                                    </div>
                                    <p className="holiday-note">📢 {h.note}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="preference-section">
                        <h2>Your Dining Preference</h2>
                        <p>Select your diet so the mess can prepare accordingly:</p>
                        <div className="preference-buttons">
                            <button
                                className={`pref-btn veg-btn ${foodPreference === 'Vegetarian' ? 'active' : ''}`}
                                onClick={() => handlePreferenceChange('Vegetarian')}
                            >
                                <span className="pref-icon">🥗</span> Vegetarian
                            </button>
                            <button
                                className={`pref-btn non-veg-btn ${foodPreference === 'Non-Vegetarian' ? 'active' : ''}`}
                                onClick={() => handlePreferenceChange('Non-Vegetarian')}
                            >
                                <span className="pref-icon">🍗</span> Non-Vegetarian
                            </button>
                        </div>
                        {foodPreference && <p className="success-msg">Your preference is set to: <strong>{foodPreference}</strong></p>}
                    </section>

                    <section className="menu-tabs-section">
                        <div className="meal-tabs">
                            {[
                                { key: 'breakfast', label: '🌅 Breakfast', time: '07:30 AM – 09:30 AM' },
                                { key: 'lunch', label: '☀️ Lunch', time: '12:30 PM – 02:30 PM' },
                                { key: 'dinner', label: '🌙 Dinner', time: '07:30 PM – 09:30 PM' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`meal-tab ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <span className="tab-label">{tab.label}</span>
                                    <span className="tab-time">{tab.time}</span>
                                </button>
                            ))}
                        </div>

                        <div className="food-grid tab-food-grid">
                            {menu[activeTab].map((item, index) => (
                                <div className="food-card" key={index}>
                                    <img src={item.img} alt={item.name} />
                                    <div className="food-info">
                                        <h3>{language === 'English' ? item.name : `[${language}] ${item.name}`}</h3>
                                        <p>{language === 'English' ? item.desc : `[${language} Translation]: ${item.desc}`}</p>
                                        <div className="ai-nutrition-tag">
                                            🥗 AI Nutrition: 250 kcal | High Protein
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="menu-footer text-center">
                        <p><em>* Special meals are provided on Sundays and festivals. Menu varies depending on the weekday.</em></p>
                    </div>
                </div>

                <div className="side-panel right-panel">
                    {sideImages.slice(2, 4).map((src, i) => (
                        <div className="side-img-wrap" key={i}>
                            <img src={src} alt={`food-side-${i + 2}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FoodMenu;
