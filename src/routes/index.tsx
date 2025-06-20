import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

function Index() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4'>
      <div className='relative max-w-4xl w-full'>
        <img
          src='/assets/images/realms_map.png'
          alt='Realms Map'
          className='w-full h-auto rounded-lg shadow-2xl'
        />

        {/* Interactive Areas */}
        <div className='absolute inset-0'>
          {/* LitRPG Academy Center - Link to main books page */}
          <Link
            to='/books'
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-24 hover:bg-yellow-400 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center'>
            <span className='text-transparent hover:text-white font-bold text-lg transition-colors duration-200'>
              Academy
            </span>
          </Link>

          {/* Xianxia Realm - Top Left */}
          <Link
            to='/realm/xianxia'
            className='absolute top-[10%] left-[15%] w-48 h-36 hover:bg-green-400 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center'>
            <span className='text-transparent hover:text-white font-bold text-xl transition-colors duration-200'>
              XIANXIA
            </span>
          </Link>

          {/* Gamelit Realm - Top Right */}
          <Link
            to='/realm/gamelit'
            className='absolute top-[10%] right-[15%] w-48 h-36 hover:bg-blue-400 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center'>
            <span className='text-transparent hover:text-white font-bold text-xl transition-colors duration-200'>
              GAMELIT
            </span>
          </Link>

          {/* Apocalypse Realm - Bottom Left */}
          <Link
            to='/realm/apocalypse'
            className='absolute bottom-[10%] left-[15%] w-48 h-36 hover:bg-gray-600 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center'>
            <span className='text-transparent hover:text-white font-bold text-xl transition-colors duration-200'>
              APOCALYPSE
            </span>
          </Link>

          {/* Isekai Realm - Bottom Right */}
          <Link
            to='/realm/isekai'
            className='absolute bottom-[10%] right-[15%] w-48 h-36 hover:bg-purple-400 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center'>
            <span className='text-transparent hover:text-white font-bold text-xl transition-colors duration-200'>
              ISEKAI
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
