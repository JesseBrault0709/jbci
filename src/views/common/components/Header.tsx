import React from 'react'
import { FunctionComponent } from 'react'

export type HeaderProps = {
    title: string
    version: string
}

const Header: FunctionComponent<HeaderProps> = props => {
    return (
        <header>
            <h1>{props.title}</h1>
            <h2>{props.version}</h2>
        </header>
    )
}

export default Header
