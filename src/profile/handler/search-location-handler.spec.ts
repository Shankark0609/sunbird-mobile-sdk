import {SearchLocationHandler} from './search-location-handler';
import { ApiService } from '../../api';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { FileService } from '../../util/file/def/file-service';
import { CachedItemStore } from '../../key-value-store';
import { LocationSearchCriteria } from '..';
import { of } from 'rxjs';

describe('SearchLocationHandler', () => {
    let searchLocationHandler: SearchLocationHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockProfileServiceConfig: Partial<ProfileServiceConfig> = {};
    const mockFileService: Partial<FileService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        searchLocationHandler = new SearchLocationHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig,
            mockFileService as FileService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of searchLocationHandler', () => {
        expect(searchLocationHandler).toBeTruthy();
    });

    it('should run handle function from the searchLocation Handler using fetchFromServer', () => {
        // arrange
        const request: LocationSearchCriteria = {
            filters: {
                type: 'sample',
                parentId: 'parent-01'
            }
        };
        mockApiService.fetch =  jest.fn(() => of({ body: {result: ''}}));
        mockCachedItemStore.getCached = jest.fn((a, b, c, d, e, f) => d());
        mockFileService.readFileFromAssets = jest.fn(() => []);
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        searchLocationHandler.handle(request).subscribe(() => {
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalledWith();
        });
    });

    it('should run handle function from the searchLocation Handler using fetchFromFile', () => {
        // arrange
        const request: LocationSearchCriteria = {
            filters: {
                type: 'sample',
                parentId: 'parent-01'
            }
        };
        mockApiService.fetch =  jest.fn(() => of({ body: {result: ''}}));
        mockCachedItemStore.getCached = jest.fn((a, b, c, d, e, f) => e());
        mockFileService.readFileFromAssets = jest.fn(() => Promise.resolve('{"result": {"response": {}}}'));
        // act
        searchLocationHandler.handle(request).subscribe(() => {
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockFileService.readFileFromAssets).toHaveBeenCalled();
        });
    });
});
