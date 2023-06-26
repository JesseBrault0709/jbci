import React from 'react'
import { FunctionComponent } from 'react'

export type HeadProps = {
    title: string
}

const Head: FunctionComponent<HeadProps> = props => {
    return (
        <head>
            <title>{props.title}</title>
            <link rel="stylesheet" href="/assets/index.css" />
        </head>
    )
}

export default Head
