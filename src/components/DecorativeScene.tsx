/**
 * DecorativeScene — clean black background for the magazine viewer.
 */
export default function DecorativeScene({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#000',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

import React from 'react'
