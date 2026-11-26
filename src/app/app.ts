import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BottomNavComponent } from './components/nav/bottom-nav.component';
import { SideNavComponent } from './components/nav/side-nav.component';
import { HeaderComponent } from './components/header/header.component';
import { MapViewComponent } from './components/map/map-view.component';
import { PlaceListComponent } from './components/place-list/place-list.component';
import { PlaceDetailComponent } from './components/place-detail/place-detail.component';
import { ReviewModalComponent } from './components/review-modal/review-modal.component';
import { PlacesService } from './services/places.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SideNavComponent,
    BottomNavComponent,
    HeaderComponent,
    MapViewComponent,
    PlaceListComponent,
    PlaceDetailComponent,
    ReviewModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly placesService = inject(PlacesService);
}
