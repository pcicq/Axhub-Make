/**
 * @name Ant Design Tokens 演示
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  ConfigProvider, 
  Tabs,
  Table,
  Tag,
  Tooltip,
  Collapse,
  message,
  theme as antTheme
} from 'antd';
import {
  BgColorsOutlined,
  FontSizeOutlined,
  ColumnHeightOutlined,
  BorderOutlined,
  BlockOutlined,
  CopyOutlined,
  CheckOutlined,
  RightOutlined
} from '@ant-design/icons';
import type { AxhubProps, AxhubHandle } from '../../common/axhub-types';
import tokens from './designToken.json';

const { Title, Text, Paragraph } = Typography;
const { useToken } = antTheme;

const CopyableText = ({ text, code = false }: { text: string, code?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success(`Copied: ${text}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Space size={4} className="copyable-text" onClick={handleCopy} style={{ cursor: 'pointer' }}>
      <Text code={code} style={{ color: 'inherit' }}>{text}</Text>
      {copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined style={{ opacity: 0.5, fontSize: 12 }} />}
    </Space>
  );
};

const ColorBlock = ({ name, value, size = 'default' }: { name: string, value: string, size?: 'small' | 'default' | 'large' }) => {
  const isLight = (color: string) => {
    // Simple check for light colors to adjust text color
    // This is a rough approximation
    return color.startsWith('#ff') || color.startsWith('#e6') || color.startsWith('#f0') || color.startsWith('#f5') || color === '#ffffff';
  };

  if (size === 'small') {
    return (
      <Tooltip title={`${name}: ${value}`}>
        <div 
          style={{ 
            width: '100%', 
            height: 32, 
            backgroundColor: value, 
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
          onClick={() => {
            navigator.clipboard.writeText(value);
            message.success(`Copied: ${value}`);
          }}
        />
      </Tooltip>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div 
        style={{ 
          height: size === 'large' ? 80 : 48, 
          backgroundColor: value, 
          borderRadius: 6, 
          marginBottom: 8,
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => {
          navigator.clipboard.writeText(value);
          message.success(`Copied: ${value}`);
        }}
      >
        <Text style={{ 
          color: isLight(value) ? 'rgba(0,0,0,0.85)' : '#fff', 
          opacity: 0.9,
          fontSize: size === 'large' ? 16 : 14
        }}>
          {value}
        </Text>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 13 }}>{name}</Text>
      </div>
    </div>
  );
};

const PaletteSection = ({ base, shades }: { base: string, shades: { name: string, value: string }[] }) => {
  const { token } = useToken();
  
  // Find the primary shade (usually index 6 or the one matching the base name if exists)
  // But shades are named like 'blue-1', 'blue-2'.
  
  return (
    <Collapse 
      ghost 
      expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
      style={{ marginBottom: 16, background: token.colorFillAlter, borderRadius: token.borderRadiusLG }}
    >
      <Collapse.Panel 
        key="1" 
        header={
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Text strong style={{ width: 100, textTransform: 'capitalize' }}>{base}</Text>
            <div style={{ flex: 1, display: 'flex', gap: 2, height: 24, borderRadius: 4, overflow: 'hidden' }}>
              {shades.map(s => (
                <Tooltip key={s.name} title={`${s.name}: ${s.value}`}>
                  <div style={{ flex: 1, height: '100%', background: s.value }} />
                </Tooltip>
              ))}
            </div>
          </div>
        }
      >
        <Row gutter={[16, 16]} style={{ padding: '8px 0' }}>
          {shades.map(({ name, value }) => (
            <Col xs={12} sm={8} md={6} lg={4} key={name}>
              <ColorBlock name={name} value={value} />
            </Col>
          ))}
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
};

const isColorValue = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) return true;
  if (/^rgba?\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(v)) return true;
  if (/^hsla?\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?%\s*,\s*\d+(\.\d+)?%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(v)) return true;
  if (/^transparent$/i.test(v)) return true;
  return false;
};

const getSortedPaletteKeys = (base: string, allKeys: string[]) => {
  const dashed = new Map<number, string>();
  const compact = new Map<number, string>();

  for (const key of allKeys) {
    const dashedMatch = key.match(new RegExp(`^${base}-(\\d+)$`));
    if (dashedMatch) {
      dashed.set(Number(dashedMatch[1]), key);
      continue;
    }
    const compactMatch = key.match(new RegExp(`^${base}(\\d+)$`));
    if (compactMatch) {
      compact.set(Number(compactMatch[1]), key);
    }
  }

  const nums = Array.from(new Set([...dashed.keys(), ...compact.keys()])).sort((a, b) => a - b);
  return nums
    .map(n => dashed.get(n) || compact.get(n))
    .filter((k): k is string => Boolean(k));
};

const Component = forwardRef<AxhubHandle, AxhubProps>((_props, ref) => {
  useImperativeHandle(ref, () => ({
    getVar: () => ({}),
    fireAction: () => {},
    eventList: [],
    actionList: [],
    varList: [],
    configList: [],
    dataList: []
  }));

  const tokenMap = tokens as unknown as Record<string, any>;
  const tokenEntries = Object.entries(tokenMap);
  const allKeys = tokenEntries.map(([k]) => k);

  const basePaletteNames = [
    'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange',
    'yellow', 'volcano', 'geekblue', 'gold', 'lime'
  ];

  const basePalette = basePaletteNames
    .filter(name => isColorValue(tokenMap[name]))
    .map(name => ({ name, value: String(tokenMap[name]) }));

  const semanticColors = tokenEntries
    .filter(([key, value]) => key.startsWith('color') && isColorValue(value))
    .map(([key, value]) => ({ name: key, value: String(value) }));

  // Separate functional colors
  const functionalColors = semanticColors.filter(c => 
    ['colorPrimary', 'colorSuccess', 'colorWarning', 'colorError', 'colorInfo', 'colorLink', 'colorTextBase', 'colorBgBase'].includes(c.name)
  );
  const otherSemanticColors = semanticColors.filter(c => 
    !['colorPrimary', 'colorSuccess', 'colorWarning', 'colorError', 'colorInfo', 'colorLink', 'colorTextBase', 'colorBgBase'].includes(c.name)
  );

  const paletteByBase = basePaletteNames
    .map(base => {
      const shadeKeys = getSortedPaletteKeys(base, allKeys);
      const shades = shadeKeys
        .map(key => ({ name: key, value: tokenMap[key] }))
        .filter(entry => isColorValue(entry.value))
        .map(entry => ({ name: entry.name, value: String(entry.value) }));
      return { base, shades };
    })
    .filter(group => group.shades.length > 0);

  const typographyKeys = allKeys.filter(k =>
    k === 'fontFamily' || k === 'fontFamilyCode' || k === 'fontSize' ||
    k.startsWith('fontSize') || k === 'lineHeight' || k.startsWith('lineHeight') ||
    k === 'fontWeightStrong'
  );

  const spacingKeys = allKeys.filter(k =>
    k.startsWith('padding') || k.startsWith('margin') || k.startsWith('size') ||
    k.startsWith('control') || k === 'controlInteractiveSize'
  );

  const radiusKeys = allKeys.filter(k => k === 'borderRadius' || k.startsWith('borderRadius'));
  const shadowKeys = allKeys.filter(k => k.startsWith('boxShadow'));
  const miscKeys = allKeys.filter(k =>
    !typographyKeys.includes(k) && 
    !spacingKeys.includes(k) && 
    !radiusKeys.includes(k) && 
    !shadowKeys.includes(k) &&
    !k.startsWith('color') &&
    !basePaletteNames.includes(k) &&
    !paletteByBase.some(g => g.shades.some(s => s.name === k)) &&
    k !== 'name' && k !== 'description'
  );

  const TokenTable = ({ keys }: { keys: string[] }) => {
    const data = keys.map(key => ({
      key,
      name: key,
      value: tokenMap[key]
    }));

    const columns = [
      {
        title: 'Token Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        render: (val: any) => (
          <CopyableText text={typeof val === 'string' ? val : JSON.stringify(val)} code />
        ),
      }
    ];

    return <Table dataSource={data} columns={columns} pagination={false} size="small" bordered />;
  };

  const items = [
    {
      key: 'colors',
      label: (
        <span><BgColorsOutlined /> Colors</span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Functional Colors */}
          <Card title="Functional Colors" size="small">
             <Row gutter={[16, 16]}>
                {functionalColors.map(({ name, value }) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={name}>
                    <ColorBlock name={name} value={value} size="large" />
                  </Col>
                ))}
             </Row>
          </Card>

          {/* Base Palette */}
          <Card title="Base Palette" size="small">
             <Row gutter={[16, 16]}>
                {basePalette.map(({ name, value }) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={name}>
                    <ColorBlock name={name} value={value} />
                  </Col>
                ))}
             </Row>
          </Card>

          {/* Color Palettes (Collapsed) */}
          <Card title="Color Palettes" size="small">
             {paletteByBase.map(group => (
               <PaletteSection key={group.base} base={group.base} shades={group.shades} />
             ))}
          </Card>

          {/* Other Semantic Colors */}
          {otherSemanticColors.length > 0 && (
            <Card title="Other Semantic Colors" size="small">
               <Row gutter={[16, 16]}>
                  {otherSemanticColors.map(({ name, value }) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={name}>
                      <ColorBlock name={name} value={value} />
                    </Col>
                  ))}
               </Row>
            </Card>
          )}
        </Space>
      ),
    },
    {
      key: 'typography',
      label: (
        <span><FontSizeOutlined /> Typography</span>
      ),
      children: <Card><TokenTable keys={typographyKeys} /></Card>,
    },
    {
      key: 'spacing',
      label: (
        <span><ColumnHeightOutlined /> Layout & Spacing</span>
      ),
      children: <Card><TokenTable keys={spacingKeys} /></Card>,
    },
    {
      key: 'components',
      label: (
        <span><BlockOutlined /> Components</span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Border Radius">
            <Row gutter={[24, 24]}>
              {radiusKeys.map(key => (
                 <Col key={key}>
                    <div style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: Number(tokenMap[key]) || 0,
                      border: '2px solid #1677ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <Text style={{ fontSize: 12 }}>{tokenMap[key]}</Text>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{key}</Text>
                    </div>
                 </Col>
              ))}
            </Row>
          </Card>
          
          <Card title="Shadows">
            <Row gutter={[24, 24]}>
               {shadowKeys.map(key => (
                 <Col xs={24} sm={12} md={8} key={key}>
                   <div style={{ 
                     height: 100, 
                     boxShadow: String(tokenMap[key]),
                     borderRadius: 8,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     padding: 16,
                     border: '1px solid #f0f0f0'
                   }}>
                     <Text style={{ fontSize: 12 }}>{key}</Text>
                   </div>
                 </Col>
               ))}
            </Row>
          </Card>
        </Space>
      ),
    },
    {
      key: 'misc',
      label: <span><BorderOutlined /> Misc</span>,
      children: <Card><TokenTable keys={miscKeys} /></Card>
    }
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: tokenMap.colorPrimary || '#1677ff',
          borderRadius: typeof tokenMap.borderRadius === 'number' ? tokenMap.borderRadius : 6,
        },
      }}
    >
      <div style={{ 
        padding: '24px', 
        background: tokenMap.colorBgLayout || '#f5f5f5', 
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <header style={{ marginBottom: 32, textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {tokenMap.name || 'Ant Design Tokens'}
            </Title>
            <Paragraph type="secondary">
              {tokenMap.description || 'Ant Design v5 Design Tokens'}
            </Paragraph>
          </header>

          <Tabs defaultActiveKey="colors" items={items} type="card" size="large" />
        </div>
      </div>
    </ConfigProvider>
  );
});

export default Component;
