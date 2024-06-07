import { Response } from 'express'
import { RepositoryRequest } from '../../src/RepositoryRequest'
import BaseConfig from '../../src/config/BaseConfig'
import { ConfigSupplier, OnSpec } from '../../src/config/Config'

interface TestReqBody {
    testProp: string
}

interface TestOnSpec extends OnSpec {}

class TestConfig extends BaseConfig<TestReqBody, TestOnSpec> {
    protected parseBody(rawBody: string, req: RepositoryRequest<TestReqBody, TestOnSpec>): Promise<TestReqBody> {
        return Promise.resolve(JSON.parse(rawBody))
    }

    protected parseAuth(req: RepositoryRequest<TestReqBody, TestOnSpec>): Promise<boolean> {
        return Promise.resolve(true)
    }

    protected parseEvent(body: TestReqBody, req: RepositoryRequest<TestReqBody, TestOnSpec>): Promise<string> {
        return Promise.resolve(body.testProp)
    }

    protected doAction(
        req: RepositoryRequest<TestReqBody, TestOnSpec>,
        res: Response<any, Record<string, any>>
    ): void {}
}

const configSupplier: ConfigSupplier = (logger, scriptRunner) => {
    return new TestConfig(logger, 'testRepository', [])
}

export default configSupplier
