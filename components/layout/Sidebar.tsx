'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Collapse,
} from '@mui/material';
import {
  People,
  Inventory,
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  Security,
  Home,
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const DRAWER_WIDTH = 260;

const navigationItems: NavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: <Home />,
  },
  {
    title: 'Users',
    path: '/users',
    icon: <People />,
  },
  {
    title: 'Products',
    path: '/products',
    icon: <Inventory />,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  variant = 'permanent'
}) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleItemClick = (itemPath: string) => {
    if (expandedItems.includes(itemPath)) {
      setExpandedItems(expandedItems.filter((path) => path !== itemPath));
    } else {
      setExpandedItems([...expandedItems, itemPath]);
    }
  };

  const isItemActive = (itemPath: string) => {
    return pathname === itemPath || pathname?.startsWith(itemPath + '/');
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isActive = isItemActive(item.path);

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            href={!hasChildren ? item.path : undefined}
            onClick={() => hasChildren && handleItemClick(item.path)}
            sx={{
              minHeight: 48,
              px: 2.5,
              pl: 2.5 + depth * 2,
              bgcolor: isActive ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: isActive ? 'action.selected' : 'action.hover',
              },
              borderLeft: isActive ? 3 : 0,
              borderColor: 'primary.main',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <List>
          {navigationItems.map((item) => renderNavItem(item))}
        </List>
      </Box>
    </>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop drawer - completely hides when closed
  if (!open) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export { DRAWER_WIDTH };
