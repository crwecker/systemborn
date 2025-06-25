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
              {/* Cultivation - Top Left */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'cultivation' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/cultivation/cultivation_realm_icon.png'
                    alt='Cultivation Realm'
                    className='w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-xl mx-auto'
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
                    className='w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>
            </div>

            {/* Center Column */}
            <div className='flex flex-col items-center justify-center space-y-8'>
              {/* Library - Top Center */}
              <div className='text-center'>
                <Link
                  to='/books'
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/library.png'
                    alt='Library'
                    className='w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Central LitRPG Academy Icon */}
              <div className='text-center'>
                <Link
                  to='/academy'
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <>
                    <img
                      src='/assets/images/litrpgacademy_realm_icon.png'
                      alt='LitRPG Academy'
                      className='w-80 h-80 xl:w-96 xl:h-96 2xl:w-[26rem] 2xl:h-[26rem] object-contain drop-shadow-xl mx-auto'
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
                    className='w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Portal - Bottom Right */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'portal' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/portal/portal_realm_icon.png'
                    alt='Portal Realm'
                    className='w-48 h-48 xl:w-56 xl:h-56 object-contain drop-shadow-xl mx-auto'
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
                  className='w-48 h-48 object-contain drop-shadow-xl mx-auto'
                />
              </Link>
            </div>

            {/* Library Icon */}
            <div className='text-center mb-8'>
              <Link
                to='/books'
                className='inline-block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                <img
                  src='/assets/images/library.png'
                  alt='Library'
                  className='w-36 h-36 object-contain drop-shadow-xl mx-auto'
                />
              </Link>
            </div>

            {/* Realm Icons Grid */}
            <div className='grid grid-cols-2 gap-6 max-w-sm mx-auto'>
              {/* Cultivation */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'cultivation' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/cultivation/cultivation_realm_icon.png'
                    alt='Cultivation Realm'
                    className='w-32 h-32 object-contain drop-shadow-xl mx-auto'
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
                    className='w-32 h-32 object-contain drop-shadow-xl mx-auto'
                  />
                </Link>
              </div>

              {/* Portal */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'portal' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'>
                  <img
                    src='/assets/images/portal/portal_realm_icon.png'
                    alt='Portal Realm'
                    className='w-32 h-32 object-contain drop-shadow-xl mx-auto'
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
                    className='w-32 h-32 object-contain drop-shadow-xl mx-auto'
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
