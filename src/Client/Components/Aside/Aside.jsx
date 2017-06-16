import React from 'react';
import  './Aside.css'
import SmartLink from '../SmartLink'

export default function MainAside({asides, loading, id, title}){
    if ( loading) {         return (<div>Loading</div>)     }
    if (asides.length === 0) {        return(null);    }

        return (
            <aside id='Asides' className="primaryAside">
                <ul>
                    {asides.map((element, index) =>{
                        var desc = {__html: element.description}
                        return (
                            <li key={index}>
                            { (element.link != null)
                            ?
                             (<SmartLink link={element.link} linkText={element.description}/>)
                            :
                            (<p dangerouslySetInnerHTML={desc} ></p>)
                            }
                            </li>
                        );}
                    )}
                </ul>
        </aside>
        );
    }
