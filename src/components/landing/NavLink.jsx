import React from 'react';

const NavLink = ({ href, children, className }) => {
    const onClick = (e) => {
        e.preventDefault();
        window.history.pushState({}, '', href);
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    };

    return (
        <a href={href} onClick={onClick} className={className}>
            {children}
        </a>
    );
};

export default NavLink;
