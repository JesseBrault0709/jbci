import Logger from '../src/Logger'
import UrlParser from '../src/UrlParser'
import http from 'http'

describe('UrlParser tests', () => {
    const logger = new Logger(
        (s, level) => {
            if (level === 'ERROR') {
                console.error(s)
            } else {
                console.log(s)
            }
        },
        (date, level, msg) => `${date.toUTCString()} ${level}: ${msg}`
    )

    it('parses correct repository and action', () => {
        const parser = new UrlParser(logger)

        const req = {
            headers: {
                host: 'ci.test.com'
            },
            url: '/test-repository/test-action'
        } as http.IncomingMessage

        const result = parser.parse(req)

        expect(result.repository).toBe('test-repository')
        expect(result.action).toBe('test-action')
    })
})
