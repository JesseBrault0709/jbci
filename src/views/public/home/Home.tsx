import React, { FormEventHandler, FunctionComponent } from 'react'
import { VERSION } from '../../../version'
import Head from '../../common/components/Head'
import Header from '../../common/components/Header'

export type HomeProps = {}

const Home: FunctionComponent<HomeProps> = props => {
    return (
        <html>
            <Head title="JBCI: Login" />
            <body>
                <Header title="JBCI: Login" version={VERSION} />
                <form action="/login" method="post">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" />

                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" />

                    <input type="submit" />
                </form>
            </body>
        </html>
    )
}

export default Home
