declare module 'resources' {

    interface LocationMarker {
        id: int;
        markerTitle: string;
        markerText: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
