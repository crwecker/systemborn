import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

function Index() {
  return (
    <div 
      className='min-h-screen flex items-center justify-center p-4 relative'
      style={{
        backgroundImage: 'url(/assets/images/starry_background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className='absolute inset-0 bg-black bg-opacity-40' />
      
      {/* Content */}
      <div className='relative z-10 max-w-6xl w-full'>
        
        {/* Welcome Text */}
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-white mb-4 drop-shadow-2xl'>
            Welcome to the LitRPG Academy
          </h1>
          <p className='text-xl text-gray-200 drop-shadow-lg'>
            Choose your realm and begin your adventure
          </p>
        </div>

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
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/xianxia/xianxia_realm_icon.png'
                    alt='Xianxia Realm'
                    className='w-32 h-32 xl:w-36 xl:h-36 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-3'>
                    <span className='text-white font-semibold text-base drop-shadow-lg'>
                      Xianxia
                    </span>
                  </div>
                </Link>
              </div>

              {/* Apocalypse - Bottom Left */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'apocalypse' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/apocalypse/apocalypse_realm_icon.png'
                    alt='Apocalypse Realm'
                    className='w-32 h-32 xl:w-36 xl:h-36 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-3'>
                    <span className='text-white font-semibold text-base drop-shadow-lg'>
                      Apocalypse
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Center Column */}
            <div className='flex flex-col items-center justify-center'>
              {/* Central LitRPG Academy Icon */}
              <div className='text-center'>
                <Link
                  to='/books'
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/litrpgacademy_realm_icon.png'
                    alt='LitRPG Academy'
                    className='w-48 h-48 xl:w-56 xl:h-56 2xl:w-64 2xl:h-64 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-3'>
                    <span className='text-white font-bold text-xl xl:text-2xl drop-shadow-lg'>
                      LitRPG Academy
                    </span>
                  </div>
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
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/gamelit/gamelit_realm_icon.png'
                    alt='GameLit Realm'
                    className='w-32 h-32 xl:w-36 xl:h-36 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-3'>
                    <span className='text-white font-semibold text-base drop-shadow-lg'>
                      GameLit
                    </span>
                  </div>
                </Link>
              </div>

              {/* Isekai - Bottom Right */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'isekai' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/isekai/isekai_realm_icon.png'
                    alt='Isekai Realm'
                    className='w-32 h-32 xl:w-36 xl:h-36 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-3'>
                    <span className='text-white font-semibold text-base drop-shadow-lg'>
                      Isekai
                    </span>
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* Mobile/Tablet Layout - Grid */}
          <div className='lg:hidden'>
            
            {/* Central LitRPG Academy Icon */}
            <div className='text-center mb-8'>
              <Link
                to='/books'
                className='inline-block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
              >
                <img
                  src='/assets/images/litrpgacademy_realm_icon.png'
                  alt='LitRPG Academy'
                  className='w-40 h-40 object-contain drop-shadow-xl mx-auto'
                />
                <div className='text-center mt-2'>
                  <span className='text-white font-bold text-lg drop-shadow-lg'>
                    LitRPG Academy
                  </span>
                </div>
              </Link>
            </div>

            {/* Realm Icons Grid */}
            <div className='grid grid-cols-2 gap-6 max-w-sm mx-auto'>
              
              {/* Xianxia */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'xianxia' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/xianxia/xianxia_realm_icon.png'
                    alt='Xianxia Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-2'>
                    <span className='text-white font-semibold text-sm drop-shadow-lg'>
                      Xianxia
                    </span>
                  </div>
                </Link>
              </div>

              {/* GameLit */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'gamelit' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/gamelit/gamelit_realm_icon.png'
                    alt='GameLit Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-2'>
                    <span className='text-white font-semibold text-sm drop-shadow-lg'>
                      GameLit
                    </span>
                  </div>
                </Link>
              </div>

              {/* Isekai */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'isekai' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/isekai/isekai_realm_icon.png'
                    alt='Isekai Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-2'>
                    <span className='text-white font-semibold text-sm drop-shadow-lg'>
                      Isekai
                    </span>
                  </div>
                </Link>
              </div>

              {/* Apocalypse */}
              <div className='text-center'>
                <Link
                  to='/realm/$realmId'
                  params={{ realmId: 'apocalypse' }}
                  className='block transform hover:scale-110 transition-all duration-300 hover:drop-shadow-2xl'
                >
                  <img
                    src='/assets/images/apocalypse/apocalypse_realm_icon.png'
                    alt='Apocalypse Realm'
                    className='w-28 h-28 object-contain drop-shadow-xl mx-auto'
                  />
                  <div className='text-center mt-2'>
                    <span className='text-white font-semibold text-sm drop-shadow-lg'>
                      Apocalypse
                    </span>
                  </div>
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* Instructions */}
        <div className='text-center mt-16'>
          <p className='text-gray-300 text-lg drop-shadow-lg'>
            Click on any realm to enter its battle arena
          </p>
          <p className='text-gray-400 text-sm mt-2 drop-shadow-lg'>
            Or visit the Academy to explore our complete book database
          </p>
        </div>

      </div>
    </div>
  )
}
