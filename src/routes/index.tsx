import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Banner } from '../components/Banner'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

function Index() {
  return (
    <div
      className='min-h-screen relative'
      style={{
        backgroundImage: 'url(/assets/images/starry_background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      {/* Dark overlay for better contrast */}
      <div className='absolute inset-0 bg-black bg-opacity-40' />

      {/* Banner at the top */}
      <div className='relative z-10'>
        <Banner />
      </div>

      {/* Content */}
      <div className='relative z-10 max-w-6xl w-full mx-auto px-4 pt-8'>
        {/* Realm Icons Layout */}
        <div className='w-full max-w-4xl mx-auto'>
          {/* Desktop Layout - Responsive Grid */}
          <div className='hidden lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12 2xl:gap-16 items-center justify-items-center max-w-6xl mx-auto'>
            {/* Left Column */}
            <div className='flex flex-col items-center space-y-8'>
              {/* Xianxia - Top Left */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'xianxia' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/xianxia/xianxia_realm_icon.png'
                    alt='Xianxia Realm'
                    className='w-64 h-64 xl:w-72 xl:h-72 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Apocalypse - Bottom Left */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'apocalypse' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/apocalypse/apocalypse_realm_icon.png'
                    alt='Apocalypse Realm'
                    className='w-64 h-64 xl:w-72 xl:h-72 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>
            </div>

            {/* Center Column */}
            <div className='flex flex-col items-center justify-center'>
              {/* Central LitRPG Academy Icon */}
              <div className='text-center'>
                <Link
                  to='/academy'
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <>
                    <img
                      src='/assets/images/litrpgacademy_realm_icon.png'
                      alt='LitRPG Academy'
                      className='w-96 h-96 xl:w-96 xl:h-96 2xl:w-96 2xl:h-96 object-contain drop-shadow-xl mx-auto'
                    />
                    <p className='text-xl text-gray-200 drop-shadow-lg mt-[-50px]'>
                      Find books, read, battle, and level up in the LitRPG
                      Academy!
                    </p>
                  </>
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className='flex flex-col items-center space-y-8'>
              {/* GameLit - Top Right */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'gamelit' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/gamelit/gamelit_realm_icon.png'
                    alt='GameLit Realm'
                    className='w-64 h-64 xl:w-72 xl:h-72 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Isekai - Bottom Right */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'isekai' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/isekai/isekai_realm_icon.png'
                    alt='Isekai Realm'
                    className='w-64 h-64 xl:w-72 xl:h-72 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout - Grid */}
          <div className='lg:hidden'>
            {/* Central LitRPG Academy Icon */}
            <div className='text-center mb-8'>
              <Link
                to='/academy'
                className='inline-block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                <img
                  src='/assets/images/litrpgacademy_realm_icon.png'
                  alt='LitRPG Academy'
                  className='w-40 h-40 object-contain drop-shadow-xl mx-auto'
                />
              </Link>
            </div>

            {/* Realm Icons Grid */}
            <div className='grid grid-cols-2 gap-6 max-w-sm mx-auto'>
              {/* Xianxia */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'xianxia' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/xianxia/xianxia_realm_icon.png'
                    alt='Xianxia Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* GameLit */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'gamelit' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/gamelit/gamelit_realm_icon.png'
                    alt='GameLit Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Isekai */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'isekai' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/isekai/isekai_realm_icon.png'
                    alt='Isekai Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Apocalypse */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'apocalypse' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/apocalypse/apocalypse_realm_icon.png'
                    alt='Apocalypse Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
