
// export const filterNavItemsByModules = (navItems, modules) => {
//   const moduleNames = modules.map((module) => module.name);

//   const filterItems = (items) => {
//     return items
//       .filter((item) => {
//         if (Array.isArray(item.moduleName)) {
//           // Check if any of the module names match
//           return item.moduleName.some((name) => moduleNames.includes(name));
//         }
//         return moduleNames.includes(item.moduleName);
//       })
//       .map((item) => {
//         // Recursively filter subMenu if it exists
//         if (item.subMenu) {
//           return {
//             ...item,
//             subMenu: filterItems(item.subMenu),
//           };
//         }
//         return item;
//       });
//   };

//   return filterItems(navItems);
// };

export const filterNavItemsByModules = (navItems, modules) => {
  const moduleNames = modules.map((module) => module.name);

  const filterItems = (items) => {
    return items
      .filter((item) => {
        // Check if any of the subMenu or the parent menu itself should be included
        const isParentVisible = moduleNames.includes(item.moduleName)  || item.default === true;

        // Check if any of the subMenu items' moduleName matches
        const filteredSubMenu = item.subMenu?.filter((subItem) =>
          moduleNames.includes(subItem.moduleName)
        );

        // If the parent menu is visible or if any subMenu is filtered, show the menu item
        return isParentVisible || (filteredSubMenu && filteredSubMenu.length > 0);
      })
      .map((item) => {
        // Recursively filter subMenu if it exists
        if (item.subMenu) {
          return {
            ...item,
            subMenu: filterItems(item.subMenu), // Pass submenus through filter
          };
        }
        return item;
      });
  };

  return filterItems(navItems);
};


