/**
 * 🏠 메인 레이아웃 컴포넌트
 * 
 * 🎯 역할:
 * - 로그인 후 모든 페이지의 공통 레이아웃을 제공
 * - 좌측 사이드바 + 상단 헤더 + 메인 콘텐츠 영역으로 구성
 * - 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트
 * 
 * 📐 레이아웃 구조:
 * ┌─────────────────────────────────┐
 * │ [사이드바]  │    [상단 헤더]      │
 * │           │ (알림, 사용자정보)   │
 * │  메뉴      ├─────────────────────│
 * │  목록      │                    │
 * │           │   [메인 콘텐츠]      │
 * │           │    <Outlet />      │
 * │           │                    │
 * └───────────┴─────────────────────┘
 * 
 * 🔧 주요 기능:
 * - 사이드바 접기/펼치기 토글 기능
 * - 실시간 알림 배지 표시 (현재: 3개)
 * - 사용자 아바타 및 이름 표시
 */

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useMainLayout } from './hooks/useMainLayout';

const MainLayout: React.FC = () => {
  // 🎛️ 레이아웃 상태 및 사용자 정보 관리 훅
  const { collapsed, setCollapsed, user, isAuthenticated, sidebarWidth } = useMainLayout();

  // 🔐 인증 확인: 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 🏗️ 전체 레이아웃 컨테이너 (좌우 배치) */}
      
      {/* 📄 좌측 사이드바 (메뉴 네비게이션) */}
      <Sidebar 
        collapsed={collapsed}                              
        onToggle={() => setCollapsed(!collapsed)}          
      />

      {/* 📱 우측 메인 영역 (헤더 + 콘텐츠) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* 🎯 상단 헤더 (고정형 AppBar) */}
        <AppBar 
          position="sticky"                                
          elevation={0}                                    
          sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            
            {/* 🔔 알림 아이콘 (배지 포함) */}
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ color: '#666' }} />
              </Badge>
            </IconButton>
            
            {/* 👤 사용자 정보 영역 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              {/* 사용자 이름 */}
              <Typography variant="body2" color="text.secondary">
                {user?.name || '사용자'}
              </Typography>
              
              {/* 사용자 아바타 (이름의 첫 글자 표시) */}
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#003875',
                fontSize: 14 
              }}>
                {user?.name?.[0] || 'U'}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 📄 메인 콘텐츠 영역 */}
        <Box sx={{ 
          flex: 1,
          p: 3,
          bgcolor: '#F5F7FA'
        }}>
          {/* 🔄 자식 라우트 컴포넌트가 여기에 렌더링됨 */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
