import { Layout, Menu, Dropdown } from 'antd'
import {
  UserOutlined,
  TranslationOutlined,
  HomeOutlined,
  DownOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  FileTextOutlined,
  FileImageOutlined,
  PercentageOutlined,
  CarOutlined,
  SendOutlined,
} from '@ant-design/icons'
import Head from 'next/head'
import { LocationMarkerIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useDarkMode } from 'next-dark-mode'
// import { useAuth } from "../../services/useAuth";
import styles from './MainLayout.module.css'
import React, { ReactNode, useEffect } from 'react'
import { useUI } from '@components/ui/context'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

export default function MainLayout({
  children,
  title = '',
}: {
  children: ReactNode
  title: string
}) {
  const route = useRouter()
  // const { logout } = useAuth();

  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()

  // const signOut = async () => {
  //   console.log("davr");
  //   await logout();
  //   route.route.push("/login");
  // };

  const logout = () => {
    localStorage.removeItem('mijoz')
    return route.push('/login')
  }

  const { user } = useUI()
  const menu = (
    <Menu>
      <Menu.Item danger key="logout" onClick={logout}>
        <span>Выйти</span>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          theme={darkModeActive ? 'dark' : 'light'}
        >
          <div className={styles.logo} />
          <Menu
            theme={darkModeActive ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={[route.pathname]}
          >
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <Link href="/">Главная</Link>
            </Menu.Item>
            <Menu.Item
              key="/cities"
              icon={
                <LocationMarkerIcon
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/cities">Города</Link>
            </Menu.Item>
            <Menu.Item
              key="/sliders"
              icon={
                <FileImageOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/sliders">Слайдеры</Link>
            </Menu.Item>
            <Menu.Item
              key="/news"
              icon={
                <UnorderedListOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/news">Новости</Link>
            </Menu.Item>
            <Menu.Item
              key="/sale"
              icon={
                <UnorderedListOutlined
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/sale">Акции</Link>
            </Menu.Item>
            <Menu.Item
              key="/terminals"
              icon={
                <LocationMarkerIcon
                  className="h-[16px] w-[16px]"
                  aria-hidden="true"
                />
              }
            >
              <Link href="/terminals">Терминалы</Link>
            </Menu.Item>
            <Menu.Item key="/events_system" icon={<SendOutlined />}>
              <Link href="/events_system">Рассылка</Link>
            </Menu.Item>
            <Menu.Item key="/delivery_pricing" icon={<CarOutlined />}>
              <Link href="/delivery_pricing">Условия доставки</Link>
            </Menu.Item>
            <Menu.Item key="/order_statuses" icon={<SettingOutlined />}>
              <Link href="/order_statuses">Статусы заказов</Link>
            </Menu.Item>
            <Menu.Item key="/configs" icon={<SettingOutlined />}>
              <Link href="/configs">Настройки</Link>
            </Menu.Item>
            <Menu.Item key="/langs" icon={<TranslationOutlined />}>
              <Link href="/langs">Языки</Link>
            </Menu.Item>
            <Menu.Item key="/users" icon={<UserOutlined />}>
              <Link href="/users">Пользователи</Link>
            </Menu.Item>
            {/* <Menu.Item key="/menus" icon={<MenuOutlined />}>
              <Link href="/menus">Пункты меню</Link>
            </Menu.Item> */}
            <Menu.Item key="/create_menu" icon={<MenuOutlined />}>
              <Link href="/create_menu">Меню</Link>
            </Menu.Item>
            <Menu.Item key="/catalog" icon={<MenuOutlined />}>
              <Link href="/catalog">Каталог</Link>
            </Menu.Item>
            <Menu.Item key="/order" icon={<MenuOutlined />}>
              <Link href="/order">Заказы</Link>
            </Menu.Item>
            <Menu.Item key="/modifiers" icon={<MenuOutlined />}>
              <Link href="/modifiers">Модификаторы</Link>
            </Menu.Item>
            <Menu.Item key="/sms_templates" icon={<FileTextOutlined />}>
              <Link href="/sms_templates">Шаблоны смс</Link>
            </Menu.Item>
            <Menu.Item key="/sales_rules" icon={<PercentageOutlined />}>
              <Link href="/sales_rules">Правила акций</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className={`${styles.siteLayoutSubHeaderBackground} px-3`}>
            <Dropdown overlay={menu}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {user?.user?.name} <DownOutlined />
              </a>
            </Dropdown>
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            <div
              className={styles.siteLayoutBackground}
              style={{ padding: 24, minHeight: 360 }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Havoqand ©{new Date().getFullYear()} Created with &hearts; by Davr
          </Footer>
        </Layout>
      </Layout>
    </>
  )
}
