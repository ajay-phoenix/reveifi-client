import React, {FC} from 'react';
import '../../feedback/_style.scss';

interface ThumbsProps {
    setThumbsUp: (arg0: number, arg1: string) => void
    setThumbsDown: (arg0: number, arg1: string) => void
    id?: number
    thumbsUp?: number
    role: string
    name: string
}

const Thumbs: FC<ThumbsProps> = ({setThumbsUp, setThumbsDown, id, thumbsUp, role, name}) => {
    return (
        <div>
            <p>
                Please rate the {role.charAt(0).toUpperCase() + role.slice(1).replace(/_+/g, ' ')}
                <strong> {name}</strong> during this
                transaction?
            </p>

            <div className='feedback-thumbs' key={id}>
          <span onClick={() => setThumbsUp(id, role)} style={{cursor: 'pointer'}}>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="49px"
                  id="Layer_1"
                  version="1.1" viewBox="0 0 44 49" width="44px">
                  <path
                      fill={thumbsUp == 1 ? 'green' : ''}
                      d="M9,49H1c-0.6,0-1-0.4-1-1V19c0-0.6,0.5-1,1-1H9c0.6,0,1,0.5,1,1v29C10,48.6,9.5,49,9,49z M2,47h6V20H2V47z M25.8,47  C25.8,47,25.8,47,25.8,47c-0.7,0-1.4,0-2.1,0c-2.7-0.1-5.9-0.6-8.2-0.9c-1.1-0.2-2.1-0.3-2.7-0.3c-0.5,0-0.9-0.5-0.9-1V21.1  c0-0.4,0.3-0.8,0.6-0.9l0.5-0.2c2.3-0.8,7-2.6,9.4-5.2c2.6-2.7,3.8-6.4,3.8-10.8c0.1-1.4,0.9-4,3.6-4c0.5,0,1.1,0.1,1.8,0.3  c0.1,0,0.3,0.1,0.4,0.2c1.1,1.1,4.7,7.6,1.3,17.5H39c0,0,0,0,0,0c0.4,0,3.4,0.1,4.6,3.9c0.2,0.5,1,2.6-0.8,5.2  c0.5,0.9,1.3,2.8,0.4,4.8c-0.1,0.2-0.5,1.4-1.3,2.2c0.5,1.7,0.4,4.5-2,6.5c-0.1,1.2-0.6,4-3,5C36.6,45.7,32.4,47,25.8,47z M14,43.9  c0.5,0.1,1.2,0.2,1.9,0.3c2.3,0.3,5.4,0.7,8,0.9c7.4,0.3,12.3-1.3,12.3-1.3c1.7-0.7,1.7-3.6,1.7-3.6c0-0.3,0.2-0.6,0.4-0.8  c2.8-2,1.5-5,1.5-5.2c-0.2-0.5,0-1,0.5-1.3c0.4-0.2,0.9-1.1,1.1-1.6c0.8-1.8-0.5-3.5-0.5-3.5c-0.3-0.4-0.3-0.9,0-1.3  c1.7-2,1-3.6,1-3.7c0,0,0-0.1-0.1-0.1C41,20.1,39.2,20,39.1,20h-7.2c-0.3,0-0.6-0.2-0.8-0.4c-0.2-0.3-0.2-0.6-0.1-0.9  c3.5-9.1,0.7-15.3-0.2-16.6C30.4,2,30.1,2,29.9,2c-1.4,0-1.5,1.8-1.5,2c0,4.9-1.4,9-4.3,12.1c-2.7,2.9-7.5,4.7-10,5.6V43.9z M5,45  c-0.6,0-1-0.4-1-1c0-0.6,0.5-1,1-1s1,0.5,1,1C6,44.6,5.5,45,5,45z"/>
              </svg>
          </span>
                <span onClick={() => setThumbsDown(id, role)} className='ml-5' style={{cursor: 'pointer'}}>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="49px"
                  id="Layer_1"
                  version="1.1" viewBox="0 0 44 49" width="44px">
                  <path
                      fill={thumbsUp == -1 ? 'red' : ''}
                      d="M35,0H43c0.6,0,1,0.4,1,1v29c0,0.6-0.5,1-1,1H35c-0.6,0-1-0.4-1-1V1C34,0.4,34.5,0,35,0z M42,2h-6v27h6V2z M18.2,2  C18.2,2,18.2,2,18.2,2c0.7,0,1.4,0,2.1,0c2.7,0.1,5.9,0.6,8.2,0.9c1.1,0.2,2.1,0.3,2.7,0.3c0.5,0,0.9,0.5,0.9,1v23.7  c0,0.4-0.3,0.8-0.6,0.9l-0.5,0.2c-2.3,0.8-7,2.6-9.4,5.2c-2.6,2.7-3.8,6.4-3.8,10.8c-0.1,1.4-0.9,4-3.6,4c-0.5,0-1.1-0.1-1.8-0.3  c-0.1,0-0.3-0.1-0.4-0.2c-1.1-1.1-4.7-7.6-1.3-17.5H5c0,0,0,0,0,0c-0.4,0-3.4-0.1-4.6-3.9c-0.2-0.5-1-2.6,0.8-5.2  c-0.5-0.9-1.3-2.8-0.4-4.8c0.1-0.2,0.5-1.4,1.3-2.2c-0.5-1.7-0.4-4.5,2-6.5c0.1-1.2,0.6-4,3-5C7.4,3.4,11.6,2,18.2,2z M30,5.1  c-0.5-0.1-1.2-0.2-1.9-0.3c-2.3-0.3-5.4-0.7-8-0.9C12.7,3.7,7.9,5.3,7.8,5.3C6.1,6,6.1,8.9,6.1,8.9c0,0.3-0.2,0.6-0.4,0.8  c-2.8,2-1.5,5-1.5,5.2c0.2,0.5,0,1-0.5,1.3c-0.4,0.2-0.9,1.1-1.1,1.6c-0.8,1.8,0.5,3.5,0.5,3.5c0.3,0.4,0.3,0.9,0,1.3  c-1.7,2-1,3.6-1,3.7c0,0,0,0.1,0.1,0.1C3,28.9,4.8,29,5,29h7.2c0.3,0,0.6,0.2,0.8,0.4c0.2,0.3,0.2,0.6,0.1,0.9  c-3.5,9.1-0.7,15.3,0.2,16.6c0.3,0.1,0.6,0.1,0.8,0.1c1.4,0,1.5-1.8,1.5-2c0-4.9,1.4-9,4.3-12.1c2.7-2.9,7.5-4.7,10-5.6V5.1z M39,4  c0.6,0,1,0.5,1,1c0,0.6-0.4,1-1,1s-1-0.5-1-1C38,4.5,38.5,4,39,4z"/>
              </svg>
          </span>
            </div>
        </div>
    );
};

export default Thumbs;
