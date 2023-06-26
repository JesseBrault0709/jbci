import { Configuration } from 'webpack'
import path from 'path'

const configuration: Configuration = {
    mode: 'development',
    entry: {
        login: {
            import: './src/views/public/home/index.tsx',
            filename: 'public/home/index.js'
        },
        dashboard: {
            import: './src/views/secure/dashboard/index.tsx',
            filename: 'secure/dashboard/index.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, path.join('build', 'static'))
    }
}

export default configuration
