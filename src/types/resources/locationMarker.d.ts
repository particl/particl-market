declare module 'resources' {

    interface LocationMarker {
        id: number;
        markerTitle: string;
        markerText: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
