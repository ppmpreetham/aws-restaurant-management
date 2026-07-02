import type { MenuItem } from '../types';

export function MenuList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return <p className="empty-state">No menu items yet.</p>;
  }

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category ?? 'Other';
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="menu-list">
      {Object.entries(byCategory).map(([category, categoryItems]) => (
        <div key={category} className="menu-category">
          <h4>{category}</h4>
          {categoryItems.map((item) => (
            <div key={item.id} className="menu-item">
              <div>
                <p className="menu-item__name">{item.name}</p>
                <p className="menu-item__desc">{item.description}</p>
              </div>
              <p className="menu-item__price">₹{item.price}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
